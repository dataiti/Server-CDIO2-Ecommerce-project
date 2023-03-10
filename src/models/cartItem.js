const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Types.ObjectId,
      ref: 'Cart',
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: 'Store',
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
    },
    optionStyle: {
      type: Object,
      default: {},
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('CartItem', cartItemSchema);
