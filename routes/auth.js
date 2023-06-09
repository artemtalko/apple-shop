const express = require('express');
const {
    createUser,
    loginUser,
    loginAdmin,
    getAllUsers,
    getSingleUser,
    deleteSingleUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logoutUser,
    updatePassword,
    getWishlist,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    getAllOrders,
    updateOrderStatus
    
} = require('../controller/user');
const {authMiddleware, isAdmin} = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);

router.post('/register', createUser);
router.post('/login-admin', loginAdmin);
router.post('/login', loginUser);
router.post('/cart', authMiddleware, userCart);
router.post('/', authMiddleware, userCart);
router.post('/cart/applycoupon', authMiddleware, applyCoupon);
router.post('/cart/cash-order', authMiddleware, createOrder);

router.get('/refresh', handleRefreshToken);
router.get('/logout', logoutUser);
router.get('/all-users', getAllUsers);
router.get('/get-orders', authMiddleware, isAdmin, getAllOrders);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/cart/orders', authMiddleware, getOrders);
router.get('/:id',  authMiddleware, isAdmin, getSingleUser);

router.delete('/empty-cart', authMiddleware, emptyCart);
router.delete('/:id', deleteSingleUser);

router.put('/edit-user', authMiddleware, updateUser);
router.put('/password', authMiddleware, updatePassword);

router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);


module.exports = router;