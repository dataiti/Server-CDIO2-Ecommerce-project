const express = require('express');
const {
  userById,
  getUser,
  getProfile,
  updateProfile,
  replacePassword,
  updateAvatar,
  followStore,
  getAllUserForAdmin,
} = require('../controllers/user');
const uploadCloud = require('../configs/configCloudinary');

const router = express.Router();

router.get('/list-users/admin', getAllUserForAdmin);
router.get('/get-user/:userId', getUser);
router.get('/profile/:userId', getProfile);
router.put('/update-profile/:userId', updateProfile);
router.put('/replace-password/:userId', replacePassword);

router.post('/upload-avatar/:userId', uploadCloud.single('avatar'), updateAvatar);

router.param('userId', userById);

module.exports = router;
