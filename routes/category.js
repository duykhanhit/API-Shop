const express = require('express');
const { 
  getCategories, 
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadPhoto
} = require('../controllers/categories');

const { protect, authorize } = require('../middlewares/auth');

const productRouter = require('./product');

const router = express.Router();

router.use('/:id/products', productRouter);

router
  .route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

router
  .route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

router
  .route('/:id/upload')
  .put(protect, authorize('admin'), uploadPhoto);

module.exports = router;