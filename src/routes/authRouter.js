const express = require("express");
const {
  register,
  login,
  createToken,
  logout,
  refreshToken,
  authSocial,
  authUpdate,
  forgotPassword,
  changePassword,
} = require("../controllers/authController");
const { sendChangePasswordEmail } = require("../controllers/emailController");
const { userById } = require("../controllers/userController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login, createToken);
router.post("/social", authSocial, authUpdate, createToken);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/fotgot-password", forgotPassword, sendChangePasswordEmail);
router.put(
  "/change-password/:forgotPasswordCode",
  changePassword,
  sendChangePasswordEmail
);
router.param("/usedId", userById);

module.exports = router;
