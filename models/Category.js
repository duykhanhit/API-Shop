const mongoose = require('mongoose');
const { slugify } = require('../utils/slug');

const CategoryChema = new mongoose.Schema({
  name : {
    type: String,
    unique: true,
    required: [true, 'Bạn chưa nhập tên thư mục.']
  },
  description: {
    type: String,
    required: [true, 'Bạn chưa nhập mô tả.']
  },
  thumbnail: {
    type: String,
    default: 'thumbnail.jpg'
  },
  slug: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: true
  }
});

CategoryChema.pre('save', function(next) {
  this.slug = slugify(this.name);
  next();
});

CategoryChema.pre('remove', async function(next) {
  await this.model('Products').deleteMany({category: this._id});
  next();
});

module.exports = mongoose.model('Categories', CategoryChema);