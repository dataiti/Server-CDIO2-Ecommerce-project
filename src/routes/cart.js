const express = require('express');
const { addCart, updateCart, removeCart, cartById, getListCartByUser } = require('../controllers/cart');
const { userById } = require('../controllers/user');

const router = express.Router();

router.get('/list-carts', getListCartByUser);
router.post('/add-cart/:userId', addCart);
// router.get('/profile/:userId', getProfile);
// router.put('/update-profile/:userId', updateProfile);
// router.put('/replace-password/:userId', replacePassword);

router.param('userId', userById);

module.exports = router;
