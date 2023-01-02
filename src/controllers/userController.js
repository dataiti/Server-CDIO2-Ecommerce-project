const fs = require('fs');
const User = require('../models/userModel');
const { cleanUser, cleanUserLess } = require('../helper/userHandler');

const userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const getlUser = async (req, res, next) => {
  try {
    return res.json({
      success: 'Get user successfully',
      data: cleanUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.user._id,
    }).exec();
    if (!user) {
      throw new Error('User not found');
    }
    return res.status(200).json({
      success: 'Get user profile successfully',
      data: cleanUserLess(user),
    });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req, res, next) => {
  const q = req.query.q || '';
  const regex = q
    .split(' ')
    .filter((i) => i)
    .join('|');
  const sortBy = req.query.sortBy || '_id';
  const order = req.query.order || 'asc';
  const limit = Number(req.query.limit) || 6;
  const page = req.query.page > 0 ? Number(req.query.page) : 1;
  let skip = (page - 1) * limit;
  const filter = { q, sortBy, order, limit, currentPage: page };
  try {
    const filterArgs = {
      $or: [
        {
          firstname: { $regex: regex, $options: 'i' },
        },
        {
          lastname: { $regex: regex, $options: 'i' },
        },
      ],
      role: { $ne: 'admin' },
    };
    const totalPage = await User.countDocuments(filterArgs);
    if (!totalPage) {
      throw new Error('User not found');
    }
    const pageCount = Math.ceil(totalPage / limit);
    filter.pageCount = pageCount;
    if (page > pageCount) {
      skip = (pageCount - 1) * limit;
    }
    if (totalPage <= 0) {
      return res.status(200).json({
        success: 'Load list users successfully',
        currentPage: page,
        totalPage,
        data: [],
      });
    }
    const users = await User.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .limit(limit)
      .skip(skip)
      .exec();
    users.forEach((user) => (user = cleanUser(user)));
    return res.status(200).json({
      success: 'Load list users successfully',
      currentPage: page,
      totalPage,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUserForAdmin = async (req, res, next) => {
  const q = req.query.q || '';
  const regex = q
    .split(' ')
    .filter((i) => i)
    .join('|');
  const sortBy = req.query.sortBy || '_id';
  const order = req.query.order || 'asc';
  const limit = Number(req.query.limit) || 6;
  const page = req.query.page > 0 ? Number(req.query.page) : 1;
  let skip = (page - 1) * limit;
  const filter = { q, sortBy, order, limit, currentPage: page };
  try {
    const filterArgs = {
      $or: [
        {
          firstname: { $regex: regex, $options: 'i' },
        },
        {
          lastname: { $regex: regex, $options: 'i' },
        },
        {
          email: { $regex: regex, $options: 'i' },
        },
        {
          phone: { $regex: regex, $options: 'i' },
        },
      ],
      role: { $ne: 'admin' },
    };
    const total = await User.countDocuments(filterArgs);
    if (!total) {
      throw new Error('User not found');
    }
    const pageCount = Math.ceil(total / limit);
    filter.pageCount = pageCount;
    if (page > pageCount) {
      skip = (pageCount - 1) * limit;
    }
    if (total <= 0) {
      return res.status(200).json({
        success: 'Load list users successfully',
        currentPage: page,
        totalPage: pageCount,
        data: [],
      });
    }
    const users = await User.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .limit(limit)
      .skip(skip)
      .exec();
    users.forEach((user) => (user = cleanUserLess(user)));
    return res.status(200).json({
      success: 'Load list users successfully',
      currentPage: page,
      totalPage: pageCount,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete({ _id: req.user._id });
    return res.status(200).json({
      success: 'Delete user successfully',
    });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  const { firstname, lastname, email, phone, id_card } = req.body;
  try {
    if (email && (req.user.googleId || req.user.facebookId)) {
      throw new Error('Can not update Google or Facebook email address');
    }
    const isEmailActive = email && req.user.email != email ? false : req.user.isEmailActive;
    const isPhoneActive = phone && req.user.phone != phone ? false : req.user.isPhoneActive;

    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { firstname, lastname, email, phone, id_card, isEmailActive, isPhoneActive } },
      { new: true },
    ).exec();
    if (!user) {
      throw new Error('User not found');
    }
    return res.status(200).json({
      success: 'Update user successfully',
      data: cleanUserLess(user),
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const user = req.user;
  try {
    const newUser = await User.findOne({ _id: user._id });
    if (!newUser) {
      throw new Error('User not found');
    }
    newUser.password_hashed = newPassword;
    await newUser.save();
    return res.status(200).json({
      success: 'Update new password successfully',
    });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  let { addresses } = req.user;
  const { address } = req.body;
  try {
    if (addresses.length >= 6) {
      throw new Error('The limit 6 adress');
    }
    addresses = [...addresses, address];
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      { $set: { addresses: addresses } },
      { new: true },
    );
    if (!user) {
      throw new Error('User not found');
    }
    return res.status(200).json({
      success: 'Add address successfully',
      data: cleanUserLess(user),
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  let { addresses } = req.user;
  const addressIndex = req.query.index && req.query.index >= 0 && req.query.index <= 6 ? Number(req.query.index) : -1;
  try {
    if (addressIndex == -1) {
      throw new Error('Adress index not found');
    }
    if (addresses.length <= addressIndex) {
      throw new Error('Address is not found');
    }
    const index = addresses.indexOf(req.body.address.trim());
    if (index != -1 && index != addresses.length) {
      throw new Error('Adress already exists');
    }
    addresses.splice(addressIndex - 1, 1, req.body.address.trim());
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      { $set: { addresses } },
      { new: true },
    );
    if (!user) {
      throw new Error('User not found');
    }
    return res.status(200).json({
      success: 'Update address successfully',
      data: cleanUserLess(user),
    });
  } catch (error) {
    next(error);
  }
};

const removeAddress = async (req, res, next) => {
  let { addresses } = req.user;
  const addressIndex = req.query.index && req.query.index >= 0 && req.query.index <= 6 ? Number(req.query.index) : -1;
  try {
    if (addressIndex == -1) {
      throw new Error('Address index not found');
    }
    addresses.splice(addressIndex - 1, 1);
    const user = await User.findByIdAndUpdate(
      {
        _id: req.user._id,
      },
      { $set: { addresses } },
      { new: true },
    );
    if (!user) {
      throw new Error('User not found');
    }
    return res.status(200).json({
      success: 'Remove address successfully',
      data: cleanUserLess(user),
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const oldpath = req.user.avatar;
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { avatar: req.filepaths[0] } },
      { new: true },
    ).exec();
    if (!user) {
      try {
        fs.unlinkSync('src/public' + req.filepaths[0]);
        return res.status(404).json({
          error: 'User not found',
        });
      } catch (error) {
        next(error);
      }
    }
    if (oldpath !== '/uploads/default.jpg') {
      try {
        fs.unlinkSync('src/public' + oldpath);
      } catch (error) {
        next(error);
      }
    }
    return res.json({
      success: 'Update avatar successfully',
      data: cleanUserLess(user),
    });
  } catch (error) {
    next(error);
  }
};

const updateCoverImage = async (req, res, next) => {
  try {
    const oldpath = req.user.cover;
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { cover: req.filepaths[0] } },
      { new: true },
    ).exec();
    if (!user) {
      try {
        fs.unlinkSync('src/public' + req.filepaths[0]);
        return res.status(404).json({
          error: 'User not found',
        });
      } catch (error) {
        next(error);
      }
    }
    if (oldpath !== '/uploads/default.jpg') {
      try {
        fs.unlinkSync('src/public' + oldpath);
      } catch (error) {
        next(error);
      }
    }
    return res.status(200).json({
      success: 'Update cover successfully',
      data: cleanUserLess(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userById,
  getlUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getAllUser,
  getAllUserForAdmin,
  updatePassword,
  addAddress,
  updateAddress,
  removeAddress,
  updateAvatar,
  updateCoverImage,
};
