const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
const Category = require('../models/category');

const categoryById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid)
    return res.status(400).json({
      success: true,
      message: 'Id is invalid',
    });

  const category = await Category.findById(id);

  if (!category)
    return res.status(400).json({
      success: true,
      message: 'This category is not found',
    });

  req.category = category;
  next();
});

const getCategory = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Get category is successfully',
    data: req.category,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  if (!req.file.path || !req.body.name) throw new Error('All fields are required');

  console.log(req.body);
  console.log(req.file);

  const newCategory = new Category({
    name: req.body.name,
    image: req.file.path,
    filenameImage: req.file.filename,
  });

  await newCategory.save();

  if (!newCategory) {
    cloudinary.uploader.destroy(req.file.filename);
    throw new Error('Create category is unsuccessfully');
  }

  return res.status(200).json({
    success: true,
    message: 'Create category is successfully',
    data: newCategory,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const oldFileNamePath = req.category.filenameImage;

  const category = await Category.findOneAndUpdate(
    {
      _id: req.category._id,
    },
    { $set: { image: req.file.path, filenameImage: req.file.filename, name: req.body.name } },
    { new: true },
  ).select('-filenameImage');

  if (!category) {
    cloudinary.uploader.destroy(filename);
    throw new Error('Update category is unsuccessfully');
  } else {
    cloudinary.uploader.destroy(oldFileNamePath);
  }

  return res.status(200).json({
    success: true,
    message: 'Update category is successfully',
    data: category,
  });
});

const removeCategory = asyncHandler(async (req, res) => {
  const deleteCategory = await Category.findOneAndDelete({ _id: req.category._id });

  if (!deleteCategory) {
    throw new Error('Remove category is unsuccessfully');
  }

  cloudinary.uploader.destroy(req.category.filenameImage);

  return res.status(200).json({
    success: true,
    message: 'Remove category is successfully',
  });
});

const getListCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().select('-filenameImage');

  return res.status(200).json({
    success: true,
    message: 'Get list categories are successfully',
    data: categories,
  });
});

const getListCategoriesForAdmin = asyncHandler(async (req, res) => {
  const search = req.query.q || '';
  const regex = search
    .split(' ')
    .filter((q) => q)
    .join('|');
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  const orderBy =
    req.query.orderBy && (req.query.orderBy == 'asc' || req.query.orderBy == 'desc') ? req.query.orderBy : 'asc';

  const limit = req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
  const page = req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
  let skip = limit * (page - 1);

  const filterArgs = {
    name: { $regex: regex, $options: 'i' },
  };

  const countCategories = await Category.countDocuments(filterArgs);

  if (!countCategories) throw new Error('List categories are not found');

  const totalPage = Math.ceil(countCategories / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const categories = await Category.find(filterArgs)
    .select('-filenameImage')
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    message: 'Get list categories are successfully',
    totalPage,
    currentPage: page,
    count: countCategories,
    data: categories,
  });
});

module.exports = {
  categoryById,
  getCategory,
  createCategory,
  updateCategory,
  removeCategory,
  getListCategories,
  getListCategoriesForAdmin,
};
