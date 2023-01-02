const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      validate: [nameAvailable, 'Name is valid'],
    },
    lastname: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      validate: [nameAvailable, 'Name is valid'],
    },
    slug: {
      type: String,
      slug: ['firtname', 'lastname'],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    isEmailActive: {
      type: Boolean,
      default: false,
    },
    email_code: {
      type: String,
    },
    isPhoneActive: {
      type: Boolean,
      default: false,
    },
    phone_code: {
      type: String,
    },
    id_card: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    salt: String,
    password_hashed: {
      type: String,
    },
    forgot_password_code: {
      type: String,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
    addresses: {
      type: [
        {
          type: String,
          trim: true,
          maxLength: 200,
          validate: [addressesLimit, 'The limit is 6 addresses'],
        },
      ],
      default: [],
    },
    avatar: {
      type: String,
      default: '/uploads/default.jpg',
    },
    cover: {
      type: String,
      min: 0,
      default: '/uploads/default.jpg',
    },
    e_wallet: {
      type: mongoose.Decimal128,
      min: 0,
      default: 0,
    },
    point: {
      type: Number,
      default: 0,
    },
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// middleware model
userSchema.pre('save', function (next) {
  try {
    const salt = bcrypt.genSaltSync(10);
    const password_hashed = bcrypt.hashSync(this.password_hashed, salt);
    this.salt = salt;
    this.password_hashed = password_hashed;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isMatchPassword = function (password) {
  try {
    return bcrypt.compareSync(password, this.password_hashed);
  } catch (error) {
    throw new Error(error);
  }
};

// validators
function addressesLimit(addresses) {
  return addresses.length <= 6;
}

function nameAvailable(value) {
  const regex = [/g[o0][o0]d[^\w]*deal/i];
  let flag = true;
  regex.forEach((regex) => {
    if (regex.test(value)) {
      flag = false;
    }
  });
  return flag;
}

module.exports = mongoose.model('User', userSchema);
