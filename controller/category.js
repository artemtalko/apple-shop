const Category = require('../models/category');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const fs = require("fs");
//create category
const createCategory = asyncHandler(async (req, res) => {
    try {
      const newCategory = await Category.create(req.body);
      res.json(newCategory);
    } catch (error) {
      throw new Error(error);
    }
});

//update category
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatedCategory);
    } catch (error) {
      throw new Error(error);
    }
});

//delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deletedCategory = await Category.findByIdAndDelete(id);
      res.json(deletedCategory);
    } catch (error) {
      throw new Error(error);
    }
});

//get category
const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getCategory = await Category.findById(id);
      res.json(getCategory);
    } catch (error) {
      throw new Error(error);
    }
});

//get all categories
const getAllCategories = asyncHandler(async (req, res) => {
    try {
      const getAllCategories = await Category.find();
      res.json(getAllCategories);
    } catch (error) {
      throw new Error(error);
    }
  });


module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getAllCategories

};