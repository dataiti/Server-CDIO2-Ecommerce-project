const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
  {
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
      required: true,
      maxLength: 3000,
    },
    price: {
      type: mongoose.Decimal128,
      required: true,
      min: 0,
    },
    promotionalPrice: {
      type: mongoose.Decimal128,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSelling: {
      type: Boolean,
      default: true,
    },
    listImage: {
      type: [String],
      validate: [listImageLimit, 'The limit is 6 image'],
      default: [],
    },
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    styleValueIds: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'StyleValue',
        },
      ],
      default: [],
    },
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      required: true,
    },
    rating: {
      type: Number,
      default: 3,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true },
);

function listImageLimit(value) {
  return value.length > 0 && value.length <= 6;
}

module.exports = mongoose.model('Product', productSchema);
