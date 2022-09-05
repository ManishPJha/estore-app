const express = require("express")
const { isAuthorizedUser, authorizedRoles } = require("../middlewares/authorizedRoutes")
const {
    newOrder,
    getSingleOrder,
    getUserLoggedinOrders,
    allOrders,
    updateOrder,
    remvoeOrder
} = require("../controllers/order.controller")

const router = express.Router();

router.route("/order/create").post(isAuthorizedUser, newOrder);
router.route("/order/:id").get(isAuthorizedUser, getSingleOrder);
router.route("/orders/profile").get(isAuthorizedUser, getUserLoggedinOrders);

router.route("/admin/orders").get(isAuthorizedUser, authorizedRoles('admin'), allOrders);
router.route("/admin/order/:id")
    .put(isAuthorizedUser, authorizedRoles('admin'), updateOrder)
    .delete(isAuthorizedUser, authorizedRoles('admin'), remvoeOrder);

module.exports = router;