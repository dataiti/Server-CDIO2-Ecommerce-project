const express = require('express');
const {
  storeById,
  getStore,
  getProfileStore,
  createStore,
  updateStore,
  updateAvatar,
  getListFeatureImages,
  addFeatureImage,
  updateFeatureImage,
  removeFeatureImage,
  getListStoresForAdmin,
  getListStoresByUser,
} = require('../controllers/store');
const { userById } = require('../controllers/user');
const uploadCloud = require('../configs/configCloudinary');

const router = express.Router();

// store
router.get('/list-stores/admin', getListStoresForAdmin);
router.get('/list-stores/by/user/:userId', getListStoresByUser);
router.get('/get-store/:storeId', getStore);
router.get('/rofile-store/:storeId', getProfileStore);
router.post('/create-store/:userId', uploadCloud.single('avatar'), createStore);
router.put('/update-store/:storeId', updateStore);
router.put('/update-avatat-store/:storeId', uploadCloud.single('avatar'), updateAvatar);

// feature image
router.get('/list-feature-image/:storeId', getListFeatureImages);
router.post('/add-feature-image/:storeId', uploadCloud.single('image'), addFeatureImage);
router.put('/update-feature-image/:storeId', uploadCloud.single('image'), updateFeatureImage);
router.delete('/remove-feature-image/:storeId', removeFeatureImage);

// param
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
