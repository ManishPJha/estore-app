const express = require("express")
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    removeProductReview
} = require("../controllers/products.controller")

const { 
    isAuthorizedUser,
    authorizedRoles
 } = require('../middlewares/authorizedRoutes')
 const {
    uploadProductStaticsFile
 } = require('../middlewares/uploadProductStaticsFile')

const router = express.Router();

router.route("/products").get(getProducts);
router.route("/products/:id").get(getProduct);
router.route("/products/create").post(isAuthorizedUser, authorizedRoles('admin'), uploadProductStaticsFile, createProduct);
router.route("/admin/products/:id")
    .put(isAuthorizedUser, authorizedRoles('admin'), updateProduct)
    .delete(isAuthorizedUser, authorizedRoles('admin'), deleteProduct);
router.route("/review").put(isAuthorizedUser, createProductReview);
router.route("/reviews").get(isAuthorizedUser, getProductReviews);
router.route("/reviews").delete(isAuthorizedUser, removeProductReview);

module.exports = router;