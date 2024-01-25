const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const zod = require("zod");

const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

const signinSchema = zod.object({
    username: zod.string(),
    password: zod.string()
})

const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})


router.get("/", async function(req, res) {
    const username = req.body.username;
    const user = await User.findOne({username});
    res.status(200).json({"message": "User data fetched", user})
})

router.post("/signup", async function (req, res) {
    try {
        const body = req.body;
        const {success} = signupSchema.safeParse(body);
        if (!success) {
            return res.status(411).json({"message": "Email already taken / Incorrect inputs"});
        }

        const {username, firstName, lastName, password} = body;
        
        const isUserExists = await User.findOne({username});
        if (isUserExists) {
            return res.status(411).json({"message": "Email already taken / Incorrect inputs"});
        }
        
        const hashedPassword = bcrypt.hashSync(password);
        const user = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName,
        })
        const userId = user._id;
        const token = jwt.sign({
            userId
        }, JWT_SECRET);
        res.status(200).json({"message": "User created successfully", token});
    } catch (error) {
        res.status(500).json({"message": "Internal Server Error"})
    }
})

router.post("/signin", async function (req, res) {
    try {
        const body = req.body;
        const {success} = signinSchema.safeParse(body);
        if (!success) {
            return res.status(411).json({"message": "Error while logging in"});
        }

        const {username, password} = body;
        
        const user = await User.findOne({username});
        const isUserLegit = bcrypt.compareSync(password, user.password);
        
        if (isUserLegit) {
            const token = jwt.sign({username}, JWT_SECRET);
            res.status(200).json({token});
        } else {
            res.status(411).json({"message": "Error while logging in"});
        }
    } catch (error) {
        res.status(500).json({"message": "Internal Server Error"})
    }
})

router.put("/update/:id", authMiddleware, async function (req, res) {
    try {
        const _id = req.params.id;
        const body = req.body;

        const {success, data} = updateSchema.safeParse(body);

        if (!success) {
            res.status(411).json({
                "message": "Error while updating information"
            })
        }

        if (data.password) {
            const hashedPassword = bcrypt.hashSync(password);
            data.password = hashedPassword;
        }

        await User.findOneAndUpdate(
            {_id},  
            { $set: data},
            {new: true}
        );
        res.status(200).json({"message": "Updated successfully"})

        } catch (error) {
            res.status(500).json({"message": "Error while updating information"})
            
        }
})

router.get("/bulk", function(req, res) {
    const name = req.query.filter;
    const body = req.body;

})

module.exports = router;
