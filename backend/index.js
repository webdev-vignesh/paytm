const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 4000;

// global middleares
app.use(cors());
app.use(express.json());

const mainRouter = require("./routes/index.js");

app.use("/api/v1", mainRouter);  
        
app.listen(port, () => {
    console.log("Server running on port", port);
})
