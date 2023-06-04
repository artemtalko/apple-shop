const express = require('express');
const { createProduct, getSingleProduct, getAllProducts, updateProduct } = require('../controller/product');
const router = express.Router();

router.post('/', createProduct);

router.get('/:id', getSingleProduct);
router.get('/', getAllProducts);

router.put('/:id', updateProduct);
module.exports = router; 