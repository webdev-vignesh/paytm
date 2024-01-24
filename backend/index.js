const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { User } = require("./db.js");
const mainRouter = require("./routes/index.js");

const app = express();
const port = 4000;

// global middleares
app.use(cors());
app.use(express.json());

app.use("/api/v1", mainRouter);  
        
app.listen(port, () => {
    console.log("Server running on port", port);
})
