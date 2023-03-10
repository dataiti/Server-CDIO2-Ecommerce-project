const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    cartItemIds: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'CartItem',
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);
