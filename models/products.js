const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
    userId:{
        type: Number
    },
    id: {
        type: Number
    },
    date:{
        type: Date,
        default: Date.now()
    },
    category: {
        type: String,
        default: "General"
    },
    description: {
        type: String,
        default: "Undefined"
    },
    sum: {
        type: Number
    },
});

const Product = mongoose.model('products',ProductsSchema);
module.exports = Product;