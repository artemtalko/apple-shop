const express = require('express');
const { createProduct,
    getSingleProduct,
    getAllProducts, 
    updateProduct, 
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,

} = require('../controller/product');

const {isAdmin, authMiddleware} = require('../middleware/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middleware/uploadImage');

const router = express.Router();


router.post('/', authMiddleware, isAdmin, createProduct);

router.get('/:id', getSingleProduct);
router.get('/', getAllProducts);

router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images',10), productImgResize, uploadImages);

router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router; 