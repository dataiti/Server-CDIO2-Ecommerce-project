const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const Review = require('../models/review');

const reviewById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid)
    return res.status(400).json({
      success: true,
      message: 'Id is invalid',
    });

  const review = await Review.findById(id);

  if (!review)
    return res.status(400).json({
      success: true,
      message: 'This review is not found',
    });

  req.review = review;
  next();
});

const createReview = asyncHandler(async (req, res) => {
  const { content, rating, storeId, productId, orderId } = req.body;
  const listImages = req.files;

  if (!content || !rating || !storeId || !productId || !orderId) throw new Error('');
});

const updateReview = asyncHandler(async (req, res) => {});

const removeReview = asyncHandler(async (req, res) => {});

const getListReviewByProduct = asyncHandler(async (req, res) => {});

module.exports = {
  reviewById,
  createReview,
  updateReview,
  removeReview,
  getListReviewByProduct,
};
