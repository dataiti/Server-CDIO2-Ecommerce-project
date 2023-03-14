const express = require('express');
const { addCart, updateCart, removeCart, removeCartItem, cartById, getListCartByUser } = require('../controllers/cart');
const { userById } = require('../controllers/user');

const router = express.Router();

router.get('/list-carts/:userId', getListCartByUser);
router.post('/add-cart/:userId', addCart);
router.delete('/remove-cart/:userId', removeCart);
router.delete('/remove-cart-item/:userId/:cartItemId', removeCartItem);

router.param('userId', userById);

module.exports = router;
