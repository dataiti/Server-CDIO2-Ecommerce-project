const express = require('express');
const {
  categoryById,
  getCategory,
  createCategory,
  updateCategory,
  removeCategory,
  getListCategories,
  getListCategoriesForAdmin,
} = require('../controllers/category');
const uploadCloud = require('../configs/configCloudinary');

const router = express.Router();

router.get('/list-categories/admin', getListCategoriesForAdmin);
router.get('/list-categories', getListCategories);
router.get('/get-category/:categoryId', getCategory);
router.post('/create-category', uploadCloud.single('image'), createCategory);
router.put('/update-category/:categoryId', uploadCloud.single('image'), updateCategory);
router.delete('/remove-category/:categoryId', removeCategory);

router.param('categoryId', categoryById);

module.exports = router;
