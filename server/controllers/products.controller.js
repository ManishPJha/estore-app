const Product = require("../models/product.model")
const ErrorHandler = require("../util/errorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const ApiFeatures = require("../util/apiFeatures")

// To get all the products
const getProducts = async (req, res, next) => {

    const perPageItem = 50;
    const productCount = await Product.countDocuments();

    // For Search Query
    const apiFeatures =
        new ApiFeatures(Product.find(), req.query)
            .search()
            .filter()
            .pagination(perPageItem)

    // const product = await Product.find();
    const product = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: product.length,
        data: product,
        totalLength: productCount,
        message: "Request successfully retrieved"
    })

}

// To get single product
const getProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        // return res.status(404).json({
        //     suceess: false,
        //     message: "Product not found"
        // });
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        data: product,
        message: "Request successfully retrieved"
    })
}

// To Create a new Product
const createProduct = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        message: `Product ${product.id} created`,
    })
})

// To Update an existing Product
const updateProduct = async (req, res, next) => {

    const isExistProduct = await Product.findById(req.params.id);

    if (!isExistProduct) {
        return res.status(404).json({
            suceess: false,
            message: "Product not found."
        })
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: product,
        message: `Product ${req.params.id} is updated successfully.`
    });

}

// To Delete Product
const deleteProduct = async (req, res, next) => {

    const isExistProduct = await Product.findById(req.params.id);

    if (!isExistProduct) {
        return res.status(404).json({
            suceess: false,
            message: "Product not found."
        })
    }

    await Product.findByIdAndRemove(req.params.id);

    res.status(200).json({
        success: true,
        message: `Product ${req.params.id} was removed successfully.`
    })

}

// Create New Review
const createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.productReviews.find(
        x => x.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        // if already reviewed then just update the review
        product.productReviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment,
                    review.rating = rating
            }
        })
    } else {
        product.productReviews.push(review);
    }

    product.ratings =
        product.productReviews.reduce((acc, item) => item.rating + acc, 0) / product.productReviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
    })

})

// Get Product Reviews
const getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.productReviews
    })
})

// Remove Product Review
const removeProductReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    const reviews = product.productReviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings =
        product.productReviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        productReviews: reviews,
        ratings,
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
    })

})

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    removeProductReview
}