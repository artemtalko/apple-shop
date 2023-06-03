const express = require('express');
const {
    createUser,
    loginUser,
    getAllUsers,
    getSingleUser,
    deleteSingleUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,

} = require('../controller/user');
const {authMiddleware, isAdmin} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);

router.get('/refresh', handleRefreshToken);
router.get('/all-users', getAllUsers);
router.get('/:id',  authMiddleware, isAdmin, getSingleUser);


router.delete('/:id', deleteSingleUser);

router.put('/edit-user', authMiddleware, updateUser);

router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);


module.exports = router;