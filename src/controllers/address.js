const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Address = require('../models/address');

const addressById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid) {
    return res.status(400).json({
      success: true,
      message: 'Id is invalid',
    });
  }

  const address = await Address.findById(id);

  if (!address)
    return res.status(400).json({
      success: true,
      message: 'This address is not found',
    });

  req.address = address;
  next();
});

const getListAdressesByUser = asyncHandler(async (req, res) => {
  const addresses = await Address.find({
    userId: req.user._id,
  });

  if (!addresses) throw new Error('List addresses are not found');

  return res.status(200).json({
    success: true,
    message: 'Get list addresses are successfully',
    data: addresses,
  });
});

const addAddress = asyncHandler(async (req, res) => {
  const { province, district, exactAddress, phone, displayName } = req.body;

  if (!province || !district || !exactAddress || !phone || !displayName) throw new Error('All fields are required');

  const newAddress = new Address({
    userId: req.user._id,
    phone,
    displayName,
    province,
    district,
    exactAddress,
  });
  await newAddress.save();

  return res.status(200).json({
    success: true,
    message: 'Add address is successfully',
    data: newAddress,
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const { province, district, exactAddress, phone, displayName } = req.body;

  const address = await Address.findOneAndUpdate(
    { _id: req.address._id },
    { $set: { province, district, exactAddress, phone, displayName } },
    { new: true },
  );

  return res.status(200).json({
    success: true,
    message: 'Update address is successfully',
    data: address,
  });
});

const removeAddress = asyncHandler(async (req, res) => {
  await Address.findOneAndDelete({ _id: req.address._id });

  return res.status(200).json({
    success: true,
    message: 'Delete address is successfully',
  });
});

module.exports = {
  addressById,
  getListAdressesByUser,
  addAddress,
  updateAddress,
  removeAddress,
};
