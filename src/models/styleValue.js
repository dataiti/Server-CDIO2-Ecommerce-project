const mongoose = require('mongoose');

const styleValueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
    },
    styleId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Style',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

styleValueSchema.index({ name: 1, styleId: 1 }, { unique: true });

module.exports = mongoose.model('StyleValue', styleValueSchema);
