const Order = require("../models/order.model");
const Product = require("../models/product.model");

const ErrorHandler = require("../util/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create a new order
const newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })

})

// Get Single Order
const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    
    const order = await Order.findById(req.params.id).populate('user','name email')
    
    if(!order){
        return next(new ErrorHandler(`No order found with this id: ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        order
    })

})

// Get Logged In User Orders
const getUserLoggedinOrders = catchAsyncErrors(async (req, res, next) => {
    
    const order = await Order.find({ user: req.user.id })

    res.status(200).json({
        success: true,
        order
    })

})

//#region Admin Routes

// Get All Orders
const allOrders = catchAsyncErrors(async (req, res, next) => {
    
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        orders,
        totalAmount
    })

})

// Update / Process Order
const updateOrder = catchAsyncErrors(async (req, res, next) => {
    
    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHandler(`Order Id : ${req.params.id} not found.`, 404));
    }
    
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler(`You have already received a delivery order for ${req.params.id}`, 400))
    }

    order.orderItems.forEach(async (item) => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status;
    order.delieverAt = Date.now();
    order.updatedAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true,
    })

})

async function updateStock(productId, quantity) {
    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false });
}

// Delete Order
const remvoeOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHandler(`Order Id : ${req.params.id} not found.`, 404));
    }

    await order.remove();

    res.status(200).json({
        success: true
    })

})

//#endregion

module.exports = {
    newOrder,
    getSingleOrder,
    getUserLoggedinOrders,
    allOrders,
    updateOrder,
    remvoeOrder
}