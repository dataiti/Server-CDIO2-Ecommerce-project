const Category = require('../models/categoryModel');

const categoryById = async (req, res, next, id) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    req.category = category;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  categoryById,
};
