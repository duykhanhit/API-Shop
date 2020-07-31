const Category = require('../models/Category');
const asyncHandle = require('../middlewares/async');
const ErrorResponse = require('../utils/ErrorResponse');

module.exports = {
    
  //@desc     Create a new category
  //@route    POST  api/categories
  //@access   private
  createCategory: asyncHandle(async (req, res, next) => {
    req.body.user = req.user.id;
    
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  }),

  //@desc     Get all category
  //@route    GET   api/categories
  //@access   public
  getCategories: asyncHandle(async (req, res, next) => {
    let category = Category.find({});

    if(req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      category = category.sort(sortBy);
    } else {
      category = category.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Category.countDocuments();

    const results =  await category.skip(startIndex).limit(limit);

    const pagination = {};

    if(startIndex > 0) {
      pagination.prev = {
        page: page - 1
      }
    }

    if(endIndex < total) {
      pagination.next = {
        page: page + 1
      }
    }

    res.status(200).json({
      success: true,
      count : total,
      pagination,
      data: results,
    });
  }),
  
  //@desc     Get single category
  //@route    GET   api/categories/:id
  //@access   public
  getCategory: asyncHandle(async (req, res, next) => {
    const category = await Category.findById(req.params.id)

    if(!category) {
      return next(new ErrorResponse(`Không tìm thấy thư mục với id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  }),
  
  //@desc     Update a category
  //@route    PUT   api/categories/:id
  //@access   private
  updateCategory: asyncHandle(async (req, res, next) => {
    let category = await Category.findById(req.params.id);

    if(!category) {
      return next(new ErrorResponse(`Không tìm thấy thư mục với id ${req.params.id}`, 404));
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  }),

  //@desc     Delete a category
  //@route    DELETE   api/categories/:id
  //@access   private
  deleteCategory: asyncHandle(async (req, res, next) => {
    let category = await Category.findById(req.params.id);

    if(!category) {
      return next(new ErrorResponse(`Không tìm thấy thư mục với id ${req.params.id}`, 404));
    }

    category.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  }),
  
  //@desc     Upload photo
  //@route    PUT   api/categories/:id
  //@access   private
  uploadPhoto: asyncHandle(async (req, res, next) => {
    const category = Category.findById(req.params.id);

    if(!category) {
      return next(new ErrorResponse(`Không tìm thấy thư mục với id ${req.params.id}`, 404));
    }

    if(!req.files) {
      return next(new ErrorResponse(`Thêm một file ảnh!`, 400));
    }

    const { file } = req.files;

    if(!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Vui lòng thêm một file ảnh!`, 400));
    }

    if(file.size > process.env.MAX_SIZE_UPLOAD) {
      return next(new ErrorResponse(`Vui lòng đăng ảnh có kích thước dưới 10MB`, 400));
    }

    file.name = `category_${req.params.id}${path.parse(file.name).ext}`;
    
    file.mv(`public/${file.name}`, async err => {
      if(err){
        console.error(err);
        return next(new ErrorResponse(`Gặp vấn đề khi upload file.`, 400));
      }
    });

    await Category.findByIdAndUpdate(req.params.id, {
      thumbnail: file.name
    });

    res.status(200).json({
      success: true,
      data: file.name
    });

  })
}