const express = require("express");
const { User } = require("../db");
const jwtSecret = require("../config");

const router = express.Router();

router.get("/", async function(req, res) {
    const username = req.body.username;
    const user = await User.findOne({username});
    res.status(200).json({"message": "User data fetched", user})
})

router.post("/signup", async function (req, res) {
    try {
        const {username, firstName, lastName, password} = req.body;
        
        const isUserExists = await User.findOne({username});
        if (isUserExists) {
            return res.status(411).json({"message": "Email already taken / Incorrect inputs"});
        }
        
        const hashedPassword = bcrypt.hashSync(password);
        const user = await User.create({
            username,
            firstName,
            lastName,
            password: hashedPassword,
        })
        const userId = user._id;
        const token = jwt.sign({
            userId
        }, jwtSecret);
        res.status(200).json({"message": "User created successfully", token});
    } catch (error) {
        res.status(500).json({"message": "Internal Server Error"})
    }
})

router.post("/signin", async function (req, res) {
    try {
        const {username, password} = req.body;
        
        const user = await User.findOne({username});
        const isUserLegit = bcrypt.compareSync(password, user.password);
        
        if (isUserLegit) {
            const token = jwt.sign({username}, jwtSecret);
            res.status(200).json({token});
        } else {
            res.status(411).json({"message": "Error while logging in"});
        }
    } catch (error) {
        res.status(500).json({"message": "Internal Server Error"})
    }
})

router.put("/update/:id", async function (req, res) {
    try {
        const _id = req.params.id;
        const  token = req.headers.authorization;
        const {firstName, lastName, password} = req.body;
        
        const isTokenVerified = jwt.verify(token, jwtSecret);
        
        if (isTokenVerified) {
            const hashedPassword = bcrypt.hashSync(password);
            await User.updateOne(
                {_id},
                {
                    $set: {
                        firstName,
                        lastName,
                        password: hashedPassword
                    }
                }
                )
                res.status(200).json({"message": "User updated successfully"})
            } else {
                res.status(401).json({"message": "Token invalid"})
            }
        } catch (error) {
            res.status(500).json({"message": "Internal Server Error"})
            
        }
    })

module.exports = router;
