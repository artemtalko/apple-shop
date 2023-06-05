const express = require('express');
const { createProduct, getSingleProduct, getAllProducts, updateProduct, deleteProduct } = require('../controller/product');
const {isAdmin, authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/', authMiddleware, isAdmin, createProduct);

router.get('/:id', getSingleProduct);
router.get('/', getAllProducts);

router.put('/:id', authMiddleware, isAdmin, updateProduct);

router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router; 