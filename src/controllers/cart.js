const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');

const cartById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid)
    return res.status(400).json({
      success: true,
      message: 'Id is invalid',
    });

  const cart = await Cart.findById(id);

  if (!cart)
    return res.status(400).json({
      success: true,
      message: 'This cart is not found',
    });

  req.cart = cart;
  next();
});

const addCart = asyncHandler(async (req, res) => {
  const { optionStyle, productId, storeId, quantity } = req.body;

  if (!optionStyle || !productId || !storeId || !quantity) throw new Error('All fields are required');

  const optionStyleParse = JSON.parse(optionStyle);

  const cart = await Cart.findOne({ userId: req.user._id });

  if (cart) {
    const cartItem = await CartItem.findOne({ cartId: cart._id, productId, storeId, optionStyleParse });

    if (cartItem) {
      cartItem.quantity += Number(quantity);
      await cartItem.save();
    } else {
      const newCartItem = new CartItem({
        cartId: cart._id,
        productId,
        storeId,
        optionStyle: optionStyleParse,
        quantity: Number(quantity),
      });
      await newCartItem.save();
      cart.cartItemIds.push(newCartItem._id);
      await cart.save();
    }
  } else {
    const newCart = new Cart({
      userId: req.user._id,
      cartItemIds: [],
    });
    await newCart.save();
    const newCartItem = new CartItem({
      cartId: newCart._id,
      storeId,
      productId,
      optionStyle: optionStyleParse,
      quantity: Number(quantity),
    });
    await newCartItem.save();
    newCart.cartItemIds.push(newCartItem._id);
    await newCart.save();
  }

  const infoCart = await Cart.findOne({ userId: req.user._id }).populate({
    path: 'cartItemIds',
    populate: {
      path: 'storeId',
      select: {
        name: 1,
        avatar: 1,
        isActive: 1,
        isOpen: 1,
      },
    },
    populate: {
      path: 'productId',
      select: {
        name: 1,
        imagePreview: 1,
        price: 1,
      },
      populate: {
        path: 'categoryId',
        select: 'name',
      },
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Add product to cart is successfully',
    data: infoCart,
  });
});

const updateCart = asyncHandler(async (req, res) => {});

const removeCart = asyncHandler(async (req, res) => {});

const getListCartByUser = asyncHandler(async (req, res) => {
  const carts = await Cart.find();

  return res.json(carts);
});

module.exports = {
  addCart,
  updateCart,
  removeCart,
  cartById,
  getListCartByUser,
};
