const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
    filenameImages: {
      type: Array,
      default: [],
    },
    listImage: {
      type: Array,
      default: [],
    },
    content: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Review', reviewSchema);
