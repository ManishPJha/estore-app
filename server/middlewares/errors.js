const ErrorHandler = require("../util/errorHandler.js");

module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500; // internal server error

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(err.statusCode).json({
            success: false,
            code: err.code,
            error: err.stack
        })
    }
    if (process.env.NODE_ENV === "PRODUCTION") {
        let error = { ...err }

        error.message = err.message

        // Wrong Mongoose ObjectId Error
        if(error.name === 'CastError'){
            const message = `Resource not found. Invalid: ${error.path}`
            error = new ErrorHandler(message, 400);
        }

        // Handling Mongoose Validations Error
        if(error.name === 'ValidationError'){
            const message = Object.values(error.errors).map((value) => value?.message);
            error = new ErrorHandler(message, 400);
        }

        // Handling Mongoose Duplicate Key Error
        if(error.code === 11000){
            const message = `Duplicate key: ${Object.keys(error.keyValue)} entered.`
            error = new ErrorHandler(message, 400);
        }

        // Handling Jwt Error
        if(error.name === 'JsonWebTokenError'){
            const message = 'JSON web token is invalid. Try again!!!';
            error = new ErrorHandler(message, 400);
        }

        if(error.name === 'TokenExpiredError'){
            const message = 'JSON web token is Expired.';
            error = new ErrorHandler(message, 400);
        }

        res.status(error.statusCode).json({
            success: false,
            error: error.message || "Internal Server Error"
        })
    }

}