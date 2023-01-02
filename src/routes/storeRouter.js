const express = require('express');

const { isAuthentication, isManager } = require('../controllers/authController');
const { storeById, getStore, createStore, getStoreProfile, updateStore } = require('../controllers/storeController');
const { upload } = require('../controllers/uploadImageController');
const { userById } = require('../controllers/userController');

const router = express.Router();

router.get('/:storeId', getStore);
router.get('/:storeId/:userId', isAuthentication, isManager, getStoreProfile);
router.post('/create/:userId', isAuthentication, upload, createStore);
router.put('/:storeId/:userId', isAuthentication, isManager, updateStore);

router.param('storeId', storeById);
router.param('userId', userById);

module.exports = router;
