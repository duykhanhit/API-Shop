const mongoose = require('mongoose');
const { slugify } = require('../utils/slug');

const ProductChema = new mongoose.Schema({
  name : {
    type: String,
    required: [true, 'Bạn chưa nhập tên sản phẩm.'],
    unique: true,
    trim: true,
    minlength: [5, 'Tên sản phẩm nhiều hơn 5 ký tự.']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Bạn chưa nhập mô tả.'],
    trim: true,
    minlength: [10, 'Mô tả quá ngắn.']
  },
  thumbnail: {
    type: String,
    default: 'thumbnail.jpg'
  },
  total: {
    type: Number,
    required: [true, 'Bạn chưa nhập số lượng sản phẩm.'],
    min: [1, 'Số lượng không hợp lệ.']
  },
  price: {
    type: Number,
    required: [true, 'Bạn chưa nhập giá bán.'],
    min: [1, 'Giá bán không hợp lệ']
  },
  promotion: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Categories',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: true
  }
});

ProductChema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.model('Products', ProductChema);