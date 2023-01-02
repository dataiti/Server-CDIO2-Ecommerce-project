const mongoose = require('mongoose');

const userFollowStoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
    isDeleted: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

userFollowStoreSchema.index({ userId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('UserFollowStore', userFollowStoreSchema);
