const express = require("express")
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/products.controller")

const { 
    isAuthorizedUser,
    authorizedRoles
 } = require('../middlewares/authorizedRoutes')

const router = express.Router();

router.route("/products").get(getProducts);
router.route("/products/:id").get(getProduct);
router.route("/products/create").post(isAuthorizedUser, authorizedRoles('admin'), createProduct);
router.route("/admin/products/:id")
    .put(isAuthorizedUser, authorizedRoles('admin'), updateProduct)
    .delete(isAuthorizedUser, authorizedRoles('admin'), deleteProduct)

module.exports = router;