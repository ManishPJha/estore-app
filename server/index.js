const express = require("express")
const bodyParser = require("body-parser");
const cors = require("cors")
const dotenv = require("dotenv")
const { connectDB } = require("./config/db")
const cookieParser = require("cookie-parser")

// Middlewares
const errorMiddleware = require("./middlewares/errors")

// routes
const products = require("./routes/product.routes")
const auth = require("./routes/auth.routes")
const order = require("./routes/order.routes")

// Handle Uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error(`ERROR: ${error.message}`)
    console.log(`server is shutting down due to uncaught exception`);
    process.exit(1);
})

// setting up config files
dotenv.config({ path: './config/config.env' });

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const app = express();

const BASE_URI = "/api/v1";

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("uploads"));

app.get("/upload", (req, res) => {
    res.render('upload');
})

app.use(BASE_URI, products);
app.use(BASE_URI, auth);
app.use(BASE_URI, order);

// Middleware To Handle Errors
app.use(errorMiddleware);

// database connections
connectDB();

const server = app.listen(PORT, () => {
    console.log(`server is running on ${PORT} in ${NODE_ENV}`);
})

// Handle Unhandled Promise exceptions
process.on('unhandledRejection', (error) => {
    console.log(`ERROR: ${error.message}`);
    console.log('Shutting down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1);
    });
})

module.exports = app;