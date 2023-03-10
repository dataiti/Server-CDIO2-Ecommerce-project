const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const moment = require('moment');
const Product = require('../models/product');
const OptionStyles = require('../models/optionStyles');
const OptionStylesItem = require('../models/optionStylesItem');

const productById = asyncHandler(async (req, res, next, id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid)
    return res.status(400).json({
      success: true,
      message: 'Id is invalid',
    });

  const product = await Product.findById(id);

  if (!product)
    return res.status(400).json({
      success: true,
      message: 'This product is not found',
    });

  req.product = product;
  next();
});

const getProduct = asyncHandler(async (req, res) => {
  if (!req.product.isActive || !req.product.isSelling) throw new Error('Product is not sell or active');

  const product = await Product.findOne({
    _id: req.product._id,
    isSelling: true,
    isActive: true,
  })
    .populate({
      path: 'optionStyles',
      select: 'name',
      populate: {
        path: 'optionStylesItem',
        select: 'name price quantity',
      },
    })
    .populate('categoryId', 'name')
    .populate('storeId', 'name avatar');

  return res.status(200).json({
    success: true,
    message: 'Get product is successfully',
    data: product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, promotinalPrice, storeId, categoryId } = req.body;
  const listImages = req.files.map((item) => item.path);
  const listFilenameImages = req.files.map((item) => item.filename);
  const optionStyles = JSON.parse(req.body.optionStyles) || [];

  if (!name || !description || !price || !storeId || !categoryId) {
    throw new Error('All fields are required');
  }

  const result = optionStyles.reduce(
    (acc, curr) => {
      curr.sizes.forEach((size) => {
        if (size.price < acc.minPrice) acc.minPrice = size.price;

        if (size.price > acc.maxPrice) acc.maxPrice = size.price;

        acc.totalQuantity += size.quantity;
      });

      return acc;
    },
    { minPrice: Infinity, maxPrice: -Infinity, totalQuantity: 0 },
  );

  const optionStylesPromises = optionStyles.map(async (item) => {
    const optionStyle = new OptionStyles({
      name: item.name,
      optionStylesItem: [],
    });
    const optionStyleItemsPromises = item.sizes.map(async (size) => {
      const optionStyleItem = new OptionStylesItem({
        name: size.name,
        quantity: size.quantity,
        price: size.price,
      });
      await optionStyleItem.save();
      optionStyle.optionStylesItem.push(optionStyleItem);
    });
    await Promise.all(optionStyleItemsPromises);
    await optionStyle.save();
    return optionStyle._id;
  });
  const optionStylesIds = await Promise.all(optionStylesPromises);

  const newProduct = new Product({
    name,
    description,
    minPrice: result.minPrice,
    maxPrice: result.maxPrice,
    totalQuantity: result.totalQuantity,
    price,
    promotinalPrice,
    imagePreview: listImages[0],
    listImages,
    listFilenameImages,
    storeId,
    categoryId,
    isSelling: true,
    optionStyles: optionStylesIds,
    isNewProduct: true,
  });
  await newProduct.save();

  if (!newProduct) {
    listFilenameImages.forEach(async (item) => {
      await cloudinary.uploader.destroy(item);
    });
    throw new Error('Create prorduct is unsuccessfully');
  }

  const now = moment();
  const createdAt = moment(newProduct.createdAt);
  const daysSinceCreation = now.diff(createdAt, 'days');
  if (daysSinceCreation > 7) {
    await Product.updateOne({ _id: newProduct._id }, { isNewProduct: false });
  }

  const formatDataProduct = await Product.findOne({ _id: newProduct._id })
    .populate({
      path: 'optionStyles',
      select: 'name',
      populate: {
        path: 'optionStylesItem',
        select: 'name price quantity',
      },
    })
    .populate('categoryId', 'name')
    .populate('storeId', 'name avatar');

  return res.status(201).json({
    success: true,
    message: 'Create product is successfully',
    data: formatDataProduct,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, promotionalPrice, storeId, categoryId } = req.body;
  const listImages = req.files ? req.files.map((item) => item.path) : req.product.listImages;
  const listFilenameImages = req.files ? req.files.map((item) => item.filename) : req.product.listFilenameImages;
  const optionStyles = JSON.parse(req.body.optionStyles) || [];

  const result = optionStyles.reduce(
    (acc, curr) => {
      curr.sizes.forEach((size) => {
        if (size.price < acc.minPrice) acc.minPrice = size.price;

        if (size.price > acc.maxPrice) acc.maxPrice = size.price;

        acc.totalQuantity += size.quantity;
      });

      return acc;
    },
    { minPrice: Infinity, maxPrice: -Infinity, totalQuantity: 0 },
  );

  // const optionStylesPromises = optionStyles.map(async (item) => {
  //   const optionStyleItemsPromises = item.sizes.map(async (size) => {
  //     const optionStyleItem = new OptionStylesItem({
  //       name: size.name,
  //       quantity: size.quantity,
  //       price: size.price,
  //     });
  //     await optionStyleItem.save();
  //     optionStyle.optionStylesItem.push(optionStyleItem);
  //     const optionStyle = await OptionStyles.findByIdAndUpdate(item._id, {$set: })
  //       name: item.name,
  //       optionStylesItem: [],
  //     });
  //   });
  //   await Promise.all(optionStyleItemsPromises);
  //   await optionStyle.save();
  //   return optionStyle._id;
  // });
  // const optionStylesIds = await Promise.all(optionStylesPromises);

  const updateProduct = await Product.findOneAndUpdate(
    { _id: req.product._id },
    {
      $set: {
        name,
        description,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
        totalQuantity: result.totalQuantity,
        price,
        promotionalPrice,
        imagePreview: listImages[0],
        listImages,
        listFilenameImages,
        storeId,
        categoryId,
        optionStylesIds,
      },
    },
    { new: true },
  )
    .populate({
      path: 'optionStyles',
      select: 'name',
      populate: {
        path: 'optionStylesItem',
        select: 'name price quantity',
      },
    })
    .populate('categoryId', 'name')
    .populate('storeId', 'name avatar');

  if (!updateProduct) {
    listFilenameImages.forEach(async (item) => {
      await cloudinary.uploader.destroy(item);
    });
    throw new Error(`Update product with id ${req.product._id} is unsuccessfully`);
  }

  return res.status(200).json({
    success: true,
    message: `Update product with id ${req.product._id} is successfully`,
    data: updateProduct,
  });
});

const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.product._id, storeId: req.store._id });

  if (!product) throw new Error('Product is not found');

  product.listFilenameImages.forEach(async (item) => {
    await cloudinary.uploader.destroy(item);
  });

  const optionStylesPromises = product.optionStyles.map(async (item) => {
    const optionStyleItemsPromises = await OptionStyles.find({ _id: item });
    optionStyleItemsPromises.map(async (optionStylesItem) => {
      optionStylesItem.optionStylesItem.map(async (item) => {
        await OptionStylesItem.findByIdAndDelete(item);
      });
      await OptionStyles.findByIdAndDelete(optionStylesItem._id);
    });
    await Promise.all(optionStyleItemsPromises);
  });
  await Promise.all(optionStylesPromises);

  await Product.findByIdAndDelete(product._id);

  return res.status(200).json({
    cuccess: true,
    message: 'Product has been deleted successfully',
  });
});

const getProductLast7daysByStore = asyncHandler(async (req, res) => {
  const today = moment();
  const weekAgo = moment().subtract(7, 'days');

  const products = await Product.find({
    createdAt: { $gte: weekAgo.toDate() },
  });

  if (!products) throw new Error('No products in the last 7 days');

  const totalProducts = products.length;
  const newProducts = products.filter((p) => moment(p.createdAt) >= weekAgo).length;
  const newProductsPercentage = (newProducts / totalProducts) * 100;

  res.json({
    success: true,
    message: 'Get product in last 7 days',
    totalProducts,
    newProducts,
    newProductsPercentage,
    data: products,
  });
});

const getStatsProductByStore = asyncHandler((req, res) => {});

const getListOfNewProducts = asyncHandler((req, res) => {});

const getListProductsByUser = asyncHandler(async (req, res) => {
  const search = req.query.q ? req.query.q : '';
  const regex = search
    .split(' ')
    .filter((q) => q)
    .join('|');
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  const orderBy =
    req.query.orderBy && (req.query.orderBy == 'asc' || req.query.orderBy == 'desc') ? req.query.orderBy : 'asc';
  const limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 6;
  const page = req.query.page && req.query.page > 0 ? Number(req.query.page) : 1;
  let skip = (page - 1) * limit;
  const categoryId = req.query.categoryId ? req.query.categoryId : -1;
  const rating = req.query.rating && req.query.rating > 0 && req.query.rating < 6 ? parseInt(req.query.rating) : -1;
  const minPrice = req.query.minPrice && req.query.minPrice > 0 ? parseInt(req.query.minPrice) : -1;
  const maxPrice = req.query.maxPrice && req.query.maxPrice > 0 ? parseInt(req.query.maxPrice) : -1;

  const filterArgs = {
    $or: [
      {
        name: { $regex: regex, $options: 'i' },
      },
      { description: { $regex: regex, $options: 'i' } },
    ],
    isSelling: true,
    isActive: true,
    promotionalPrice: { $gte: 0 },
    price: { $gte: 0 },
    rating: { $gte: 0 },
  };

  if (rating !== -1) filterArgs.rating.$gte = rating;
  if (minPrice !== -1) filterArgs.price.$gte = minPrice;
  if (maxPrice !== -1) filterArgs.price.$lte = maxPrice;
  if (categoryId !== -1) filterArgs.categoryId.$in = categoryId;

  const coutProducts = await Product.countDocuments(filterArgs);

  if (!coutProducts) throw new Error('List products are not found');

  const totalPage = Math.ceil(coutProducts / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const products = await Product.find(filterArgs)
    .select('-listFilenameImages')
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'optionStyles',
      select: 'name',
      populate: {
        path: 'optionStylesItem',
        select: 'name price quantity',
      },
    })
    .populate('categoryId', 'name')
    .populate('storeId', 'name avatar');

  return res.status(200).json({
    success: true,
    message: 'Get list product are successfully',
    totalPage,
    currentPage: page,
    count: coutProducts,
    data: products,
  });
});

const getListProductsByStore = asyncHandler(async (req, res) => {
  const search = req.query.q ? req.query.q : '';
  const regex = search
    .split(' ')
    .filter((q) => q)
    .join('|');
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  const orderBy =
    req.query.orderBy && (req.query.orderBy == 'asc' || req.query.orderBy == 'desc') ? req.query.orderBy : 'asc';
  const limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 6;
  const page = req.query.page && req.query.page > 0 ? Number(req.query.page) : 1;
  let skip = (page - 1) * limit;
  const categoryId = req.query.categoryId ? req.query.categoryId : -1;
  const rating = req.query.rating && req.query.rating > 0 && req.query.rating < 6 ? parseInt(req.query.rating) : -1;
  const minPrice = req.query.minPrice && req.query.minPrice > 0 ? parseInt(req.query.minPrice) : -1;
  const maxPrice = req.query.maxPrice && req.query.maxPrice > 0 ? parseInt(req.query.maxPrice) : -1;

  const filterArgs = {
    $or: [
      {
        name: { $regex: regex, $options: 'i' },
      },
      { description: { $regex: regex, $options: 'i' } },
    ],
    isSelling: true,
    isActive: true,
    storeId: req.store._id,
    promotionalPrice: { $gte: 0 },
    price: { $gte: 0 },
    rating: { $gte: 0 },
  };

  if (rating !== -1) filterArgs.rating.$gte = rating;
  if (minPrice !== -1) filterArgs.price.$gte = minPrice;
  if (maxPrice !== -1) filterArgs.price.$lte = maxPrice;
  if (categoryId !== -1) filterArgs.categoryId.$in = categoryId;

  const coutProducts = await Product.countDocuments(filterArgs);

  if (!coutProducts) throw new Error('List products are not found');

  const totalPage = Math.ceil(coutProducts / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const products = await Product.find(filterArgs)
    .select('-listFilenameImages')
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'optionStyles',
      select: 'name',
      populate: {
        path: 'optionStylesItem',
        select: 'name price quantity',
      },
    })
    .populate('categoryId', 'name')
    .populate('storeId', 'name avatar');

  return res.status(200).json({
    success: true,
    message: 'Get list product are successfully',
    totalPage,
    currentPage: page,
    count: coutProducts,
    data: products,
  });
});

const getListProductsForAdmin = asyncHandler(async (req, res) => {
  const search = req.query.q ? req.query.q : '';
  const regex = search
    .split(' ')
    .filter((q) => q)
    .join('|');
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  const orderBy =
    req.query.orderBy && (req.query.orderBy == 'asc' || req.query.orderBy == 'desc') ? req.query.orderBy : 'asc';
  const limit = req.query.limit && req.query.limit > 0 ? Number(req.query.limit) : 6;
  const page = req.query.page && req.query.page > 0 ? Number(req.query.page) : 1;
  let skip = (page - 1) * limit;

  const filterArgs = {
    name: { $regex: regex, $options: 'i' },
    description: { $regex: regex, $options: 'i' },
  };

  const coutProducts = await Product.countDocuments(filterArgs);

  if (!coutProducts) throw new Error('List products are not found');

  const totalPage = Math.ceil(coutProducts / limit);

  if (page > totalPage) skip = (totalPage - 1) * limit;

  const products = await Product.find(filterArgs)
    .sort({ [sortBy]: orderBy, _id: 1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    message: 'Get list product are successfully',
    totalPage,
    currentPage: page,
    count: coutProducts,
    data: products,
  });
});

module.exports = {
  productById,
  getProduct,
  createProduct,
  updateProduct,
  removeProduct,
  getProductLast7daysByStore,
  getListOfNewProducts,
  getListProductsByUser,
  getListProductsByStore,
  getListProductsForAdmin,
};
