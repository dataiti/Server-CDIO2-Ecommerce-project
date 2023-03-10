const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const JWT = require('jsonwebtoken');
const { cleanUserMore } = require('../helper/userHandler');

const generateAccessToken = (_id) => {
  return JWT.sign({ _id }, process.env.JWT_SECRET_ACCESS_KEY, { expiresIn: '1d' });
};

const generateRefreshToken = (_id) => {
  return JWT.sign({ _id }, process.env.JWT_SECRET_REFRESH_KEY, { expiresIn: '30d' });
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) throw new Error('All fields are required');

  const user = await User.findOne({ email });

  if (user) throw new Error('This email already exists');

  const newUser = new User(req.body);

  await newUser.save();

  return res.status(200).json({
    success: true,
    message: 'Register is successfully',
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new Error('All fields are required');

  const user = await User.findOne({ email });

  if (!user) throw new Error('This user is not found');

  if (!user.isCorrectPassword(password)) throw new Error('Password is incorrect');

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  await User.findOneAndUpdate(
    {
      _id: user._id,
    },
    { $set: { refreshToken: newRefreshToken } },
    { new: true },
  );

  return (
    res
      // .cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(200)
      .json({
        success: true,
        accessToken,
        data: cleanUserMore(user),
      })
  );
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;

  // if (!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies');

  await User.findOneAndUpdate(
    {
      refreshToken: cookie.refreshToken,
    },
    { $set: { refreshToken: '' } },
    { new: true },
  );

  return (
    res
      // .clearCookie('refreshToken', { httpOnly: true, secure: true })
      .status(200)
      .json({
        success: true,
        message: 'Logout successfully',
      })
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;

  // if (!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies');

  const decoded = JWT.verify(cookie.refreshToken, process.env.JWT_SECRET_REFRESH_KEY);

  const user = await User.findOne({
    _id: decoded._id,
    refreshToken: cookie.refreshToken,
  });

  const newAccessToken = generateAccessToken(user._id);

  return res.status(200).json({
    success: true,
    message: 'Get refresh token is successfully',
    accessToken: newAccessToken,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {});

const resetPassword = asyncHandler(async (req, res) => {});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};
