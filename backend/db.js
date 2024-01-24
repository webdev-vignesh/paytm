const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB")
    })

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    password: String
})

const Users = mongoose.model("Users", userSchema);

module.exports = { Users };