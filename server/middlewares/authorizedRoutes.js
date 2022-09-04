const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ErrorHandler = require("../util/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// check if user is authenticated or not
exports.isAuthorizedUser = catchAsyncErrors(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Login first to access this resources.", 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decoded.id);

    next();

})

// Handling users roles
exports.authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resources.`, 403)
            );
        }
        next();
    }
}