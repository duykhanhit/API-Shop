const express = require('express');
const { 
  getProducts, 
  createProduct, 
  getProduct, 
  updateProduct,
  deleteProduct,
  uploadPhoto
} = require('../controllers/products');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true});

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router
  .route('/:id/upload')
  .put(protect, authorize('admin'), uploadPhoto);

module.exports = router;