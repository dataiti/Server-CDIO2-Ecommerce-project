const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const verifyToken = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          cuccess: false,
          message: 'Access token is invalid',
        });
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({
      cuccess: false,
      message: 'Access token is required',
    });
  }
});

const isOwnerStore = asyncHandler(async (req, res, next) => {
  if (!req.user._id.equals(req.store.ownerId)) {
    return res.status(401).json({
      cuccess: false,
      message: 'You are not the owner of this store',
    });
  } else {
    next();
  }
});

const isAdminSystem = asyncHandler(async (req, res, next) => {
  if (req.user.permissions !== 'admin') {
    return res.status(401).json({
      cuccess: false,
      message: 'You are not the admin of this sytem',
    });
  } else {
    next();
  }
});

module.exports = {
  verifyToken,
  isOwnerStore,
  isAdminSystem,
};
