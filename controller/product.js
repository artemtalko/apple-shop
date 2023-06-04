const Product = require('../models/product');
const asyncHandler = require('express-async-handler');

const createProduct = asyncHandler(async(req,res) => {
   try {
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
   } catch(error){
    throw new Error(error);
   }
});

const getSingleProduct = asyncHandler(async(req,res) => {
    const {id} = req.params;
    try{
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch(error) {
        throw new Error(error);
    }
});

const getAllProducts = asyncHandler(async(req,res) => {
    try{
        const getAllProducts = await Product.find();
        res.json(getAllProducts);
    } catch(error){
        throw new Error(error);
    }
});


module.exports = {createProduct, getSingleProduct, getAllProducts};