const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

mongoose.plugin(slug);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
    },
    displayName: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      slug: 'username',
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      default: 'CDIO2-project/dedault_jd3qnu',
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/doo78f14s/image/upload/v1677427616/CDIO2-project/dedault_jd3qnu.jpg',
    },
    permissions: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
    wishlistIds: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'Store',
        },
      ],
      default: [],
    },
    facebookId: {
      type: String,
    },
    gooogleId: {
      type: String,
    },
    storeId: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
  createPasswordChangedToken: async function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    return resetToken;
  },
};

module.exports = mongoose.model('User', userSchema);
