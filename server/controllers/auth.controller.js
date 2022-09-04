const User = require("../models/user.model");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../util/errorHandler");
const sendToken = require("../util/jwtToken");
const sendEmail = require("../util/sendEmail");
const crypto = require("crypto");

// Register a user
const registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'image/upload/v1660061054',
            url: 'https://res.cloudinary.com/dsevoj7lq/image/upload/v1660061054/cld-sample.jpg'
        }
    })

    //#region previous JWT token response method
    // const token = user.getJwtToken();

    // res.status(201).json({
    //     success: true,
    //     token
    // })
    //#endregion

    sendToken(user, 200, res)

})

// Login User
const loginUser = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body;

    // check if email and password is enterd by a user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password to login.', 400))
    }

    // Find user in database
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler('Invalid email or password.', 401))
    }

    // Check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password.', 401))
    }

    //#region previous Jwt token response method
    // const token = user.getJwtToken();

    // res.status(200).json({
    //     success: true,
    //     token
    // })
    //#endregion

    sendToken(user, 200, res)

})

// Forgot Password
const forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found on this email.", 404));
    }

    // Get reset token
    const resetToken = user.getPasswordResetToken();

    await user.save({ validateBeforeSave: false })

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow: \n \n ${resetUrl} \n \n If you have not requested this email, then ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'fantasyApp Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email has been sent to ${user.email}`
        })

    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })
    }

})

// Reset Password
const resetPassword = catchAsyncErrors(async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler("Password reset token is invalid or has been expired.", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match.", 400));
    }

    // Set up new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})

// Get Currently Authenticated User Details
const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// Update / Change User Password
const updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    // Check Previous User Password
    const isMatchedWithPrevious = await user.comparePassword(req.body.oldPassword);

    if (!isMatchedWithPrevious) {
        return next(new ErrorHandler("Old password is incorrect."));
    }

    user.password = req.body.password;

    await user.save();

    sendToken(user, 200, res)

})

const updateProfile = catchAsyncErrors(async (req, res, next) => {
    
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    // Update Avaratr : TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
    })

})

// Logout User
const logoutUser = catchAsyncErrors((req, res, next) => {

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged out successfully."
    })

})

//#region Admin Routes

// Get All Users
const allUsers = catchAsyncErrors(async (req, res, next) => {

    const users = await User.find();

    const totalCount = await User.countDocuments();

    res.status(200).json({
        success: true,
        users,
        totalCount
    })
})

// Get User Details
const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not fount with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true.valueOf,
        user
    })

})

// Update User Profile
const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
    })
})

// Remove User
const removeUser = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`))
    }

    // Remove avatar from cloudinary : TODO

    await user.remove();

    res.status(200).json({
        success: true
    })

})

//#endregion

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateProfile,
    allUsers,
    getUserDetails,
    updateUserProfile,
    removeUser
};