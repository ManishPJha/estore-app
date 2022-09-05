const express = require("express")
const {
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
} = require("../controllers/auth.controller")
const { isAuthorizedUser, authorizedRoles } = require("../middlewares/authorizedRoutes")

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logoutUser);

router.route('/profile').get(isAuthorizedUser, getUserProfile)
router.route('/password/update').put(isAuthorizedUser, updatePassword);
router.route('/profile/update').put(isAuthorizedUser, updateProfile);

// Admin Routes
router.route('/admin/users').get(isAuthorizedUser, authorizedRoles('admin'), allUsers);
router.route('/admin/user/:id')
    .get(isAuthorizedUser, authorizedRoles('admin'), getUserDetails)
    .put(isAuthorizedUser, authorizedRoles('admin'), updateUserProfile)
    .delete(isAuthorizedUser, authorizedRoles('admin'), removeUser)

module.exports = router;