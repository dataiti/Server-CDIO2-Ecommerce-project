const express = require('express');

const { isAuthentication, verifyCurrentPassword, isAdmin } = require('../controllers/authController');
const {
  getlUser,
  getUserProfile,
  userById,
  updateUserProfile,
  updatePassword,
  addAddress,
  updateAddress,
  removeAddress,
  deleteUser,
  getAllUser,
  getAllUserForAdmin,
  updateAvatar,
} = require('../controllers/userController');
const { upload } = require('../controllers/uploadImageController');

const router = express.Router();

router.get('/all', getAllUser);
router.get('/all/admin/:userId', isAuthentication, isAdmin, getAllUserForAdmin);
router.get('/:userId', getlUser);
router.get('/profile/:userId', isAuthentication, getUserProfile);
router.put('/profile/:userId', isAuthentication, updateUserProfile);
router.delete('/:userId', isAuthentication, deleteUser);
router.put('/update-password/:userId', isAuthentication, verifyCurrentPassword, updatePassword);

router.post('/address/:userId', isAuthentication, addAddress);
router.put('/address/:userId', isAuthentication, updateAddress);
router.delete('/address/:userId', isAuthentication, removeAddress);

router.put('/avatar/:userId', isAuthentication, upload, updateAvatar);
router.put('/cover/image/:userId', isAuthentication, upload, updateAvatar);

router.param('userId', userById);

module.exports = router;
