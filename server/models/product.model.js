const mongoose = require("mongoose");

const productScheama = new mongoose.Schema({
    brandId: { type: Object },
    sellerId: { type: Object },
    buyerId: { type: Object },
    productName: {
        type: String,
        required: [true, "Please enter a product name"],
        trim: true,
        maxLength:[100, "Product name cannot exceed 100 characters."]
    },
    productDescription: {
        type: String,
    },
    productImage: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    productPrice: {
        type: Number,
        required: [true, "Please enter a product price"],
        maxLength:[5, "Product price cannot exceed more than 5 digits."]
    },
    productReviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    productQuantity: {
        type: Number,
        default: 1
    },
    category: {
        required: [true, "Please enter a product category"],
        type: String,
        trim: true,
        maxLength: 50,
        enum: {
            values: [
                "Electronics",
                "Fashion",
                "Mobiles",
                "Furniture",
                "Sports",
                "Cosmetics",
                "Watches",
                "Toys",
                "Books",
                "Speakers",
                "Laptops",
                "Accessories",
                "Headphones",
            ],
            message: "Please select correct category"
        }

    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now()
    },
    modifiedDate: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Product', productScheama);