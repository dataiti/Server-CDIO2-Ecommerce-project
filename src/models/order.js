const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    deliveryId: {
      type: mongoose.Types.ObjectId,
      ref: 'Delivery',
      required: true,
    },
    shippingAddressId: {
      type: mongoose.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    status: {
      type: String,
      default: 'Waiting Confirm',
      enum: ['Waiting Confirm', 'Preparing Goods', 'Shipping', 'Delivered', 'Cancelled'],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['PayPal', 'COD'],
      default: 'COD',
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    optionStyle: {
      type: Object,
      default: {},
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
