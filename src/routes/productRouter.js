const express = require('express');
const { productById, getProduct } = require('../controllers/productController');

const router = express.Router();

router.get('/:productId', getProduct);

router.param('productId', productById);

module.exports = router;
