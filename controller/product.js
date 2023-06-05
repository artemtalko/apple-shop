const Product = require('../models/product');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');


//create product
const createProduct = asyncHandler(async(req,res) => {
    try {
        if (req.body.title) {
          req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
      } catch (error) {
        throw new Error(error);
      }
});


//update product
const updateProduct = asyncHandler(async(req,res) => {
  const {id} = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//delete a product
const deleteProduct = asyncHandler(async(req,res) => {
  const {id} = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const deleteProduct = await Product.findOneAndDelete({ _id: id }, req.body, {
      new: true,
    });
    
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});


//get product
const getSingleProduct = asyncHandler(async(req,res) => {
    const {id} = req.params;
    try{
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch(error) {
        throw new Error(error);
    }
});

//get all products
const getAllProducts = asyncHandler(async(req,res) => {
  try {
        const getAllProducts = await Product.where('category').equals(req.query.category);
        res.json(getAllProducts);
    } catch(error){
        throw new Error(error);
    }
});


module.exports = {createProduct, getSingleProduct, getAllProducts, updateProduct, deleteProduct};