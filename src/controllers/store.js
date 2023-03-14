const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const Store = require('../models/store');
const User = require('../models/user');
const { cleanStore } = require('../helper/storeHandler');

const storeById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid)
    return res.status(400).json({
      success: false,
      message: 'Id is invalid',
    });

  const store = await Store.findById(id).populate('ownerId');

  if (!store)
    return res.status(400).json({
      success: false,
      message: 'This store is not found',
    });

  req.store = store;
  next();
});

const getStore = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Get user is successfully',
    data: cleanStore(req.store),
  });
});

const getProfileStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ _id: req.store._id, ownerId: req.user._id });

  if (!store) throw new Error('Get profile store is unsuccessfully');

  return res.status(200).json({
    success: true,
    message: 'Get profile store is successfully',
    data: cleanStore(store),
  });
});

const createStore = asyncHandler(async (req, res) => {
  const { name, bio, location } = req.body;
  const avatar = req.file.path;
  const filenameAvatar = req.file.filename;

  if (!name || !bio || !avatar || !filenameAvatar || !location) throw new Error('All fields are required');

  const existingStore = await Store.findOne({ ownerId: req.user._id });

  if (existingStore) throw new Error('You already have a store');

  const newStore = new Store({
    name,
    bio,
    location,
    ownerId: req.user._id,
    avatar,
    filenameAvatar,
  });
  await newStore.save();

  if (!newStore) {
    cloudinary.uploader.destroy(filenameAvatar);
    throw new Error('Create store is unsuccessfully');
  }

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { $set: { storeId: newStore._id } },
    { new: true },
  );

  return res.status(200).json({
    success: true,
    message: 'Create store is successfully',
    data: cleanStore(newStore),
  });
});

const updateStore = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;

  const store = await Store.findOneAndUpdate(
    {
      _id: req.store._id,
    },
    { $set: { name, bio } },
    { new: true },
  );

  return res.status(200).json({
    success: true,
    message: 'Update store is successfully',
    data: cleanStore(store),
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatar = req.file.path;
  const filenameAvatar = req.file.filename;
  const oldFilenamePath = req.store.filenameAvatar;

  const store = await Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { avatar, filenameAvatar } },
    { new: true },
  );

  if (!store) {
    cloudinary.uploader.destroy(filenameAvatar);
    throw new Error('Update avatar is unsuccessfully');
  }
  if (filenameAvatar != oldFilenamePath) cloudinary.uploader.destroy(oldFilenamePath);

  return res.status(200).json({
    success: true,
    message: 'Update avatar store is successfully',
    data: cleanStore(store),
  });
});

const isOpenStore = asyncHandler(async (req, res) => {});

const getListFeatureImages = asyncHandler(async (req, res) => {
  const featureImages = req.store.featureImages;

  return res.status(200).json({
    success: true,
    message: 'Update avatar store is successfully',
    data: featureImages,
  });
});

const addFeatureImage = asyncHandler(async (req, res) => {
  const image = req.file.path;
  const filename = req.file.filename;
  let featureImages = req.store.featureImages;
  let filenameFeatureImages = req.store.filenameFeatureImages;

  if (featureImages.length > 6) throw new Error('The limit feature images of the store');

  featureImages = [...featureImages, image];
  filenameFeatureImages = [...filenameFeatureImages, filename];

  const store = await Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { featureImages, filenameFeatureImages } },
    { new: true },
  );

  if (!store) {
    cloudinary.uploader.destroy(filename);
    throw new Error('Add a feature image is unsuccessfully');
  }

  return res.status(200).json({
    success: true,
    message: 'Add a feature image is successfully',
    data: store.featureImages,
  });
});

const updateFeatureImage = asyncHandler(async (req, res) => {
  const index = req.query.index && req.query.index > 0 && req.query.index <= 6 ? Number(req.query.index) : -1;
  const image = req.file.path;
  const filename = req.file.filename;
  let featureImages = req.store.featureImages;
  let filenameFeatureImages = req.store.filenameFeatureImages;
  const oldFilenamePath = filenameFeatureImages[index - 1];

  if (index === -1) {
    cloudinary.uploader.destroy(filename);
    throw new Error('Index feature image is invalid');
  }

  featureImages.splice(index - 1, 1, image);
  filenameFeatureImages.splice(index - 1, 1, filename);

  const store = await Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { featureImages, filenameFeatureImages } },
    { new: true },
  );

  if (!store) {
    cloudinary.uploader.destroy(filename);
    throw new Error('Update a feature image is unsuccessfully');
  }

  cloudinary.uploader.destroy(oldFilenamePath);

  return res.status(200).json({
    success: true,
    message: 'Update a feature image is successfully',
    data: store.featureImages,
  });
});

const removeFeatureImage = asyncHandler(async (req, res) => {});

const getListStoresByUser = asyncHandler(async (req, res) => {
  const search = req.query.q ? req.query.q : '';
  const regex = search
    .split(' ')
    .filter((w) => w)
    .join('|');

  let isActive = [true, false];
  if (req.query.isActive == 'true') isActive = [true];
  if (req.query.isActive == 'false') isActive = [false];

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  const orderBy =
    req.query.orderBy && (req.query.orderBy == 'asc' || req.query.orderBy == 'desc') ? req.query.orderBy : 'asc';

  const limit = req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 4;
  const page = req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
  let skip = limit * (page - 1);

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' }, ownerId: req.user._id },
      { bio: { $regex: regex, $options: 'i' }, ownerId: req.user._id },
      { location: { $regex: regex, $options: 'i' } },
    ],
    isActive: { $in: isActive },
  };

  const countStores = await Store.countDocuments(filterArgs);

  if (!countStores) throw new Error('List stores are not found');

  const totalPage = Math.ceil(countStores / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const stores = await Store.find(filterArgs)
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit)
    .populate('ownerId', 'avatar displayName');

  return res.status(200).json({
    success: true,
    message: 'Get list stores are successfully',
    totalPage,
    currentPage: page,
    count: countStores,
    data: stores,
  });
});

const getListStoresForAdmin = asyncHandler(async (req, res) => {
  const search = req.query.search ? req.query.search : '';
  const regex = search
    .split(' ')
    .filter((w) => w)
    .join('|');

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  const orderBy =
    req.query.orderBy && (req.query.orderBy == 'asc' || req.query.orderBy == 'desc') ? req.query.orderBy : 'asc';

  const limit = req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
  const page = req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
  let skip = limit * (page - 1);

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' } },
      { bio: { $regex: regex, $options: 'i' } },
      { location: { $regex: regex, $options: 'i' } },
    ],
  };

  const countStores = await Store.countDocuments(filterArgs);

  if (!countStores) throw new Error('List stores are not found');

  const totalPage = Math.ceil(countStores / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const stores = await Store.find(filterArgs)
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit)
    .populate('ownerId', 'avatar displayName');

  return res.status(200).json({
    success: true,
    message: 'Get list stores are successfully',
    totalPage,
    currentPage: page,
    count: countStores,
    data: stores,
  });
});

module.exports = {
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
  getListStoresByUser,
  getListStoresForAdmin,
};
