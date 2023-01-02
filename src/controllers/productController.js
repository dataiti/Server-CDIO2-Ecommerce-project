const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

const productById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    req.product = product;
    next();
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  const { isActive, isSelling, _id } = req.product;
  try {
    if (!isActive || !isSelling) {
      throw new Error('Active or Selling product not found');
    }
    const product = await Product.findOne({ _id, isSelling: true, isActive: true })
      .populate({
        path: 'categoryId',
        populate: {
          path: 'categoryId',
          populate: 'categoryId',
        },
      })
      .populate({
        path: 'styleValueIds',
        populate: 'styleId',
      })
      .populate('storeId', '_id name avatar isActive isOpen')
      .exec();
    if (!product) {
      throw new Error('Product not found');
    }
    return res.status(200).json({
      success: 'Get product successfully',
      data: product,
    });
    console.log(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  productById,
  getProduct,
};
