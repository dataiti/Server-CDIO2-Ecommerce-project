const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 300,
  },
  slug: {
    type: String,
    slug: 'name',
    unique: true,
  },
  description: {
    type: String,
    trim: true,
    maxLength: 3000,
  },
  price: {
    type: mongoose.Decimal128,
    required: true,
    min: 0,
  },
  minPrice: {
    type: mongoose.Decimal128,
    required: true,
    min: 0,
  },
  maxPrice: {
    type: mongoose.Decimal128,
    required: true,
    min: 0,
  },
  promotinalPrice: {
    type: mongoose.Decimal128,
    min: 0,
  },
  totalQuantity: {
    type: Number,
    min: 0,
  },
  optionStyles: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'OptionStyles',
      },
    ],
    default: [],
  },
  sold: {
    type: Number,
    default: 0,
    min: 0,
  },
  imagePreview: {
    type: String,
    trim: true,
  },
  listImages: {
    type: [String],
    default: [],
  },
  listFilenameImages: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  storeId: {
    type: mongoose.Types.ObjectId,
    ref: 'Store',
  },
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
  },
  isNewProduct: {
    type: Boolean,
  },
  isSelling: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Product', productSchema);
