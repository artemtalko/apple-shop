const express = require('express');
const { createProduct,
    getSingleProduct,
    getAllProducts, 
    updateProduct, 
    deleteProduct,
    addToWishlist,
    rating,
} = require('../controller/product');

const {isAdmin, authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/', authMiddleware, isAdmin, createProduct);

router.get('/:id', getSingleProduct);
router.get('/', getAllProducts);

router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);
router.put('/:id', authMiddleware, isAdmin, updateProduct);

router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router; 