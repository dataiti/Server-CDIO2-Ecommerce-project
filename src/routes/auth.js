const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  isAuth,
  isOwner,
  isAdmin,
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
