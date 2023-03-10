const express = require('express');
const {
  productById,
  createProduct,
  updateProduct,
  getProduct,
  removeProduct,
  getProductLast7daysByStore,
  getListOfNewProducts,
  getListProductsByStore,
} = require('../controllers/product');
const { storeById } = require('../controllers/store');
const uploadCloud = require('../configs/configCloudinary');

const router = express.Router();

// router.get('/list-users/admin', getAllUserForAdmin);
router.get('/list-products/last-7days/:storeId', getProductLast7daysByStore);
router.get('/list-products/by-store/:storeId', getListProductsByStore);
router.get('/list-users/admin', getProduct);
router.post('/create-product/:storeId', uploadCloud.array('images'), createProduct);
router.put('/update-product/:storeId/:productId', uploadCloud.array('images'), updateProduct);
router.delete('/delete-product/:storeId/:productId', removeProduct);

router.param('storeId', storeById);
router.param('productId', productById);

module.exports = router;
