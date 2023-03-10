const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');

const User = require('../models/user');
const { cleanUserMore, cleanUserLess } = require('../helper/userHandler');

const userById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid)
    return res.status(400).json({
      success: true,
      message: 'Id is invalid',
    });

  const user = await User.findById(id);

  if (!user)
    return res.status(400).json({
      success: true,
      message: 'This user is not found',
    });

  req.user = user;
  next();
});

const getUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Get user is successfully',
    data: cleanUserLess(req.user),
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  return res.status(200).json({
    success: true,
    message: 'Get profile user is successfully',
    data: cleanUserMore(user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, displayName, email, phone } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { username, displayName, email, phone } },
    { new: true },
  );

  return res.status(200).json({
    success: true,
    message: 'Update profile user is successfully',
    data: cleanUserMore(user),
  });
});

const replacePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) throw new Error('All fields are required');

  if (newPassword !== confirmPassword) throw new Error('New password and confirm password are not match');

  const user = await User.findOne({ _id: req.user._id });

  if (!user.isCorrectPassword) throw new Error('Password is incorrect');

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Replace password is successfully',
    data: cleanUserMore(user),
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const oldFilenamePath = req.user.filename;

  const user = await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { $set: { avatar: req.file.path, filename: req.file.filename } },
    { new: true },
  );

  if (!user) {
    cloudinary.uploader.destroy(req.file.filename);
    throw new Error('Upload avatar is unsuccessfully');
  }
  if (oldFilenamePath != 'CDIO2-project/dedault_jd3qnu') cloudinary.uploader.destroy(oldFilenamePath);

  return res.status(200).json({
    success: true,
    message: 'Upload avatar is successfully',
    data: cleanUserMore(user),
  });
});

const followStore = asyncHandler(async (req, res) => {});

const getAllUserForAdmin = asyncHandler(async (req, res) => {
  const search = req.query.q || '';
  const regex = search
    .split(' ')
    .filter((q) => q)
    .join('|');
  const sortBy = req.query.sortBy || '_id';
  const orderBy = req.query.orderBy || 'asc';
  const limit = Number(req.query.limit) || 6;
  const page = Number(req.query.limit) || 1;
  let skip = (page - 1) * limit;

  const filterArgs = {
    $or: [
      { username: { $regex: regex, $options: 'i' } },
      { email: { $regex: regex, $options: 'i' } },
      { phone: { $regex: regex, $options: 'i' } },
    ],
    permissions: { $ne: 'admin' },
  };

  const countUser = await User.countDocuments(filterArgs);

  if (!countUser) throw new Error('List users are not found');

  const totalPage = Math.ceil(countUser / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const users = await User.find(filterArgs)
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit);

  if (users) {
    users.forEach((user) => {
      user = cleanUserMore(user);
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Get list users are successfully',
    totalPage,
    currentPage: page,
    count: countUser,
    data: users,
  });
});

module.exports = {
  userById,
  getUser,
  getProfile,
  updateProfile,
  replacePassword,
  updateAvatar,
  followStore,
  getAllUserForAdmin,
};
