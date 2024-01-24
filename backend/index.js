const express = require("express");
const bcrypt = require("bcryptjs");
// const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { Users } = require("./db.js");

const app = express();
const port = 4000;

app.use(express.json());

app.post("/signup", async function (req, res) {
    const {firstName, lastName, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password);

    const user = await Users.create({
        firstName,
        lastName,
        password: hashedPassword,
    })
    user.save();
    res.status(201).json({msg: "User created successfully"});
})

app.post("/signin", async function (req, res) {
    const {firstName, password} = req.body;

    const user = await Users.findOne({firstName});
    const isUserLegit = bcrypt.compareSync(password, user.password);

    if (isUserLegit) {
        const token = jwt.sign({firstName}, process.env.SECRET_KEY);
        res.status(200).json({token});
    } else {
        res.status(401).json({msg: "Invalid credentials"});
    }
})

app.put("/update", function (req, res) {

})


app.listen(port, () => {
    console.log("App running on port", port);
})