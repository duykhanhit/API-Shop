const Product = require("../models/Product");
const asyncHandle = require("../middlewares/async");
const ErrorResponse = require("../utils/ErrorResponse");
const path = require("path");
const Category = require("../models/Category");

module.exports = {
  //@desc     Create a new product
  //@route    POST  api/categories/:id/products
  //@access   private
  createProduct: asyncHandle(async (req, res, next) => {
    
    req.body.category = req.params.id;
    req.body.user = req.user.id;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(
        new ErrorResponse(`Không tìm thấy thư mục với id ${req.params.id}`)
      );
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  }),

  //@desc     Get all products
  //@route    GET   api/products
  //@access   public
  getProducts: asyncHandle(async (req, res, next) => {
    let product;
    let total;
    if (req.params.id) {
      product = Product.find({ category: req.params.id });
      total = await Product.countDocuments({ category: req.params.id });
    } else {
      product = Product.find({});
      total = await Product.countDocuments();
    }
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      product = product.sort(sortBy);
    } else {
      product = product.sort("-createdAt");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = await product.skip(startIndex).limit(limit).populate({
      path: "category",
      select: "name description",
    });

    const pagination = {};

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
      };
    }

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
      };
    }

    res.status(200).json({
      success: true,
      count: total,
      pagination,
      data: results,
    });
  }),

  //@desc     Get single product
  //@route    GET   api/products/:id
  //@access   public
  getProduct: asyncHandle(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(
          `Không tìm thấy sản phẩm với id ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }),

  //@desc     Update a product
  //@route    PUT   api/products/:id
  //@access   private
  updateProduct: asyncHandle(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(
          `Không tìm thấy sản phẩm với id ${req.params.id}`,
          404
        )
      );
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  }),

  //@desc     Delete a product
  //@route    DELETE   api/products/:id
  //@access   private
  deleteProduct: asyncHandle(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(
          `Không tìm thấy sản phẩm với id ${req.params.id}`,
          404
        )
      );
    }

    product.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  }),

  //@desc     Upload photo
  //@route    PUT   api/products/:id
  //@access   private
  uploadPhoto: asyncHandle(async (req, res, next) => {
    const product = Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(
          `Không tìm thấy sản phẩm với id ${req.params.id}`,
          404
        )
      );
    }

    if (!req.files) {
      return next(new ErrorResponse(`Thêm một file ảnh!`, 400));
    }

    const { file } = req.files;

    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorResponse(`Vui lòng thêm một file ảnh!`, 400));
    }

    if (file.size > process.env.MAX_SIZE_UPLOAD) {
      return next(
        new ErrorResponse(`Vui lòng đăng ảnh có kích thước dưới 10MB`, 400)
      );
    }

    file.name = `product_${req.params.id}${path.parse(file.name).ext}`;

    file.mv(`public/${file.name}`, async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Gặp vấn đề khi upload file.`, 400));
      }
    });

    await Product.findByIdAndUpdate(req.params.id, {
      thumbnail: file.name,
    });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  }),
};
