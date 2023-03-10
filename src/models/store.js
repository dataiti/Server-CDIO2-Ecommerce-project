const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 300,
    },
    bio: {
      type: String,
      trim: true,
      required: true,
      maxLength: 1000,
    },
    slug: {
      type: String,
      slug: 'name',
      unique: true,
    },
    ownerId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: String,
      required: true,
    },
    // totalProduct: {
    //   type: Number,
    //   default: 0,
    // },
    avatar: {
      type: String,
      required: true,
    },
    filenameAvatar: {
      type: String,
      required: true,
    },
    featureImages: {
      type: [String],
      default: [],
    },
    filenameFeatureImages: {
      type: [String],
      default: [],
    },
    eWallet: {
      type: mongoose.Decimal128,
      min: 0,
      default: 0,
    },
    point: {
      point: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    userFollowIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    isOpen: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Store', storeSchema);
