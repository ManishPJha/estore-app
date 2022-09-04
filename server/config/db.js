const mongoose = require("mongoose");

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10000, //  max pool size for connections
    }).then(con => {
        console.log("Connected to MongoDB database with HOST: " + con.connection.host + ".");
    })
}

module.exports = { connectDB }