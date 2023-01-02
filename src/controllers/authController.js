const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');

const generateAccessToken = (_id) => {
  const accessToken = jwt.sign({ _id }, process.env.JWT_SECRET_ACCESS_KEY, {
    expiresIn: '2h',
  });
  return accessToken;
};

const generateRefreshToken = (_id) => {
  const accessToken = jwt.sign({ _id }, process.env.JWT_SECRET_REFRESH_KEY, {
    expiresIn: '365d',
  });
  return accessToken;
};

const generateForgotPasswordToken = (email, phone) => {
  const forgotPasswordToken = jwt.sign({ email, phone }, process.env.JWT_SECRET_FORGOT_PASSWORD_KEY);
  return forgotPasswordToken;
};

const register = async (req, res, next) => {
  const { firstname, lastname, email, phone, password } = req.body;
  try {
    const user = new User({
      firstname,
      lastname,
      email,
      phone,
      password_hashed: password,
    });
    await user.save();
    return res.status(200).json({
      success: 'Signing up successfully, you can sign in now',
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, phone, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [
        {
          email: { $exists: true, $ne: null, $eq: email },
          googleId: { $exists: false, $eq: null },
          facebookId: { $exists: false, $eq: null },
        },
        {
          phone: { $exists: true, $ne: null, $eq: phone },
          googleId: { $exists: false, $eq: null },
          facebookId: { $exists: false, $eq: null },
        },
      ],
    }).exec();
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isMatchPassword(password)) {
      throw new Error("Password doesn't match");
    }
    req.auth = user;
    next();
  } catch (error) {
    next(error);
  }
};

const createToken = async (req, res, next) => {
  const user = req.auth;
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  try {
    const token = new RefreshToken({ jwt: refreshToken });
    const tokenSave = await token.save();
    if (!tokenSave) {
      throw new Error('Create JWT failed, please try sign in again');
    }
    return res.status(200).json({
      success: 'Sigin successfully',
      _id: user._id,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    await RefreshToken.findOneAndDelete({ jwt: refreshToken }).exec();
    return res.status(200).json({ success: 'Logout successfully' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    const token = await RefreshToken.findOne({ jwt: refreshToken }).exec();
    if (!token) {
      throw new Error('Refresh token is invalid');
    }
    const decoded = jwt.verify(token.jwt, process.env.JWT_SECRET_REFRESH_KEY);
    const newAccessToken = generateAccessToken(decoded._id);
    const newRefreshToken = generateRefreshToken(decoded._id);
    const refreshTokenUpdate = await RefreshToken.findOneAndUpdate(
      { jwt: refreshToken },
      { $set: { jwt: newRefreshToken } },
      { new: true },
    ).exec();
    if (!refreshTokenUpdate) {
      throw new Error('Create JWT is faild, try again later');
    }
    return res.status(200).json({
      success: 'Refresh token succesffully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const authSocial = async (req, res, next) => {
  const { googleId, facebookId } = req.body;
  try {
    if (!googleId && !facebookId) {
      throw new Error('googleId or facebookId is required');
    }
    const user = await User.findOne({
      $or: [
        { googleId: { $exists: true, $ne: null, $eq: googleId } },
        { facebookId: { $exists: true, $ne: null, $eq: facebookId } },
      ],
    }).exec();
    if (!user) {
      next();
    }
    req.auth = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authUpdate = async (req, res, next) => {
  const { firstname, lastname, email, googleId, facebookId } = req.body;
  try {
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email, phone } = req.body;
  try {
    const forgotPasswordToken = generateForgotPasswordToken(email, phone);
    const user = await User.findOneAndUpdate(
      {
        $or: [{ email: { $exists: true, $ne: null, $eq: email } }, { phone: { $exists: true, $ne: null, $eq: phone } }],
      },
      { $set: { forgot_password_code: forgotPasswordToken } },
      { new: true },
    ).exec();
    if (!user) {
      throw new Error('User not found');
    }
    const message = {
      email: email || '',
      phone: phone || '',
      name: user.firstname + ' ' + user.lastname,
      title: 'Change password',
      text: 'Please click on the following link to change your password.',
      code: forgotPasswordToken,
    };
    req.message = message;
    next();
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  const { forgotPasswordCode } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      {
        forgot_password_code: forgotPasswordCode,
      },
      {
        $unset: { forgot_password_code: '' },
      },
      { new: true },
    );
    if (!user) {
      throw new Error('User not found');
    }
    user.password_hashed = password;
    await user.save();
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const verifyCurrentPassword = async (req, res, next) => {
  const { currentPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isMatchPassword(currentPassword)) {
      throw new Error("Current password doesn't match");
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Authentication & Authorization
const isAuthentication = async (req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1]) {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY);
    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized! Please log in again',
      });
    }
    if (req.user._id == decoded._id) {
      next();
    }
  } else {
    return res.status(401).json({
      error: 'No token provided! Please sign in again',
    });
  }
};

const isManager = async (req, res, next) => {
  if (!req.user._id.equals(req.store.ownerId) && req.store.staffIds.indexOf(req.user._id) === -1) {
    return res.status(403).json({
      error: 'Store Manager resource! Access denied',
    });
  }
  next();
};

const isAdmin = async (req, res, next) => {
  if (req.user.role != 'admin') {
    return res.status(403).json({
      error: 'Admin resource! Access denied',
    });
  }
  next();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  register,
  login,
  createToken,
  logout,
  refreshToken,
  authSocial,
  authUpdate,
  forgotPassword,
  changePassword,
  verifyCurrentPassword,
  isAuthentication,
  isManager,
  isAdmin,
};
