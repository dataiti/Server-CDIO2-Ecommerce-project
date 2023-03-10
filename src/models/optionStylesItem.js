const mongoose = require('mongoose');

const optionStylesItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      trim: true,
    },
    price: {
      type: Number,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('OptionStylesItem', optionStylesItemSchema);
