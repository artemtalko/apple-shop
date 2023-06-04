const express = require('express');
const { createProduct, getSingleProduct, getAllProducts } = require('../controller/product');
const router = express.Router();

router.post('/', createProduct);
router.get('/:id', getSingleProduct);
router.get('/', getAllProducts);

module.exports = router; 