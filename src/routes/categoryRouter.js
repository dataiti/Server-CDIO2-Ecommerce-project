const express = require('express');
const { categoryById } = require('../controllers/categoryController');

const router = express.Router();

router.get('/:categoryId');

router.param('categoryId', categoryById);

module.exports = router;
