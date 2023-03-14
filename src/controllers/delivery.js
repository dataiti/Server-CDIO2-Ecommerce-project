const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const Delivery = require('../models/delivery');

const deliveryById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid)
    return res.status(400).json({
      success: true,
      message: 'Id is invalid',
    });

  const delivery = await Delivery.findById(id);

  if (!delivery)
    return res.status(400).json({
      success: true,
      message: 'This delivery is not found',
    });

  req.delivery = delivery;
  next();
});

const getDelivery = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Get delivery is successfully',
    data: req.delivery,
  });
});

const createDelivery = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;

  if (!req.file.path || !name || !description || !price) throw new Error('All fields are required');

  const newDelivery = new Delivery({
    name,
    description,
    price,
    logo: req.file.path,
    filenameImage: req.file.filename,
  });

  await newDelivery.save();

  if (!newDelivery) {
    cloudinary.uploader.destroy(req.file.filename);
    throw new Error('Create delivery is unsuccessfully');
  }

  return res.status(200).json({
    success: true,
    message: 'Create delivery is successfully',
    data: newDelivery,
  });
});

const updateDelivery = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;

  const oldFileNamePath = req.delivery.filenameImage;

  const delivery = await Delivery.findOneAndUpdate(
    {
      _id: req.delivery._id,
    },
    { $set: { image: req.file.path, filenameImage: req.file.filename, name, description, price } },
    { new: true },
  ).select('-filenameImage');

  if (!delivery) {
    cloudinary.uploader.destroy(filename);
    throw new Error('Update delivery is unsuccessfully');
  } else {
    cloudinary.uploader.destroy(oldFileNamePath);
  }

  return res.status(200).json({
    success: true,
    message: 'Update delivery is successfully',
    data: delivery,
  });
});

const removeDelivery = asyncHandler(async (req, res) => {
  const deleteDelivery = await Delivery.findOneAndDelete({ _id: req.delivery._id });

  if (!deleteDelivery) {
    throw new Error('Remove Delivery is unsuccessfully');
  }

  cloudinary.uploader.destroy(req.delivery.filenameImage);

  return res.status(200).json({
    success: true,
    message: 'Remove Delivery is successfully',
  });
});

const getListDeliveriesForAdmin = asyncHandler(async (req, res) => {
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
    $or: [{ name: { $regex: regex, $options: 'i' } }, { description: { $regex: regex, $options: 'i' } }],
  };

  const countDeliveries = await Delivery.countDocuments(filterArgs);

  if (!countDeliveries) throw new Error('List categories are not found');

  const totalPage = Math.ceil(countDeliveries / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const deliveries = await Delivery.find(filterArgs)
    .select('-filenameImage')
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    message: 'Get list deliveries are successfully',
    totalPage,
    currentPage: page,
    count: countDeliveries,
    data: deliveries,
  });
});

module.exports = {
  deliveryById,
  getDelivery,
  createDelivery,
  updateDelivery,
  removeDelivery,
  getListDeliveriesForAdmin,
};
