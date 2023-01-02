const fs = require('fs');
const Store = require('../models/storeModel');
const { cleanStore } = require('../helper/storeHandler');
const { cleanUser } = require('../helper/userHandler');

const storeById = async (req, res, next, id) => {
  try {
    const store = await Store.findById(id);
    if (!store) {
      throw new Error('Store not found');
    }
    req.store = store;
    next();
  } catch (error) {
    next(error);
  }
};

const getStore = async (req, res, next) => {
  try {
    const store = await Store.findOne({ _id: req.store._id });
    if (!store) {
      throw new Error('Store not found');
    }
    return res.status(200).json({
      success: 'Get store successfully',
      data: cleanStore(store),
    });
  } catch (error) {
    next(error);
  }
};

const getStoreProfile = async (req, res, next) => {
  try {
    const store = await Store.findOne({
      _id: req.store._id,
    })
      .populate('ownerId')
      .populate('staffIds')
      .exec();
    if (!store) {
      throw new Error('Store not found');
    }
    store.ownerId = cleanUser(store.ownerId);
    store.staffIds.forEach((staff) => (staff = cleanUser(staff)));
    return res.status(200).json({
      success: 'Get store profile successfully',
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  const { name, bio } = req.fields;
  const avatar = req.filepaths[0];
  const cover = req.filepaths[1];
  try {
    if (!name || !bio || !avatar || !cover) {
      try {
        fs.unlinkSync('src/public' + req.filepaths[0]);
        fs.unlinkSync('src/public' + req.filepaths[1]);
        return res.status(404).json({
          error: 'All fields are required',
        });
      } catch (error) {
        next(error);
      }
    }
    const store = new Store({ name, bio, avatar, cover, ownerId: req.user._id });
    const newStore = await store.save();
    if (!newStore) {
      throw new Error('Create store is fail');
    }
    return res.status(200).json({
      success: 'Create store successfully',
      storeId: store._id,
    });
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  const { name, bio } = req.body;
  try {
    const store = await Store.findOneAndUpdate(
      {
        _id: req.store._id,
      },
      { $set: { name, bio } },
      { new: true },
    )
      .populate('ownerId')
      .populate('staffIds')
      .exec();
    if (!store) {
      throw new Error('Store not found');
    }
    store.ownerId = cleanUser(store.ownerId);
    store.staffIds.forEach((staff) => (staff = cleanUser(staff)));
    return res.status(200).json({
      success: 'Update store profile successfully',
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { storeById, getStore, createStore, updateStore, getStoreProfile };
