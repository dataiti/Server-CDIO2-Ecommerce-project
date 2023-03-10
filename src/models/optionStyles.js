const mongoose = require('mongoose');

const optionStylesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    optionStylesItem: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'OptionStylesItem',
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('OptionStyles', optionStylesSchema);
