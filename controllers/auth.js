const User = require("../models/User");
const asyncHandle = require("../middlewares/async");
const ErrorResponse = require("../utils/ErrorResponse");
const sendTokenResponse = require("../utils/sendTokenResponse");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");

module.exports = {
  //@desc     Create a new account
  //@route    POST  api/auth/register
  //@access   public
  register: asyncHandle(async (req, res, next) => {
    const user = await User.create(req.body);

    sendTokenResponse(user, 201, res);
  }),

  //@desc     Login
  //@route    POST  api/auth/login
  //@access   public
  login: asyncHandle(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse(`Bạn chưa nhập email hoặc mật khẩu.`, 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse(`Tài khoản không tồn tại.`, 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse(`Bạn nhập sai mật khẩu.`, 401));
    }

    sendTokenResponse(user, 200, res);
  }),

  //@desc     Get profile
  //@route    GET  api/auth/profile
  //@access   private
  getProfile: asyncHandle(async (req, res, next) => {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  }),

  //@desc     Reset password
  //@route    POST  api/auth/reset/:resetToken
  //@access   public
  resetPassword: asyncHandle(async (req, res, next) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(
        new ErrorResponse(`Token không tồn tại hoặc đã hết hạn.`, 400)
      );
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  }),

  //@desc     Forgot password
  //@route    POST  api/auth/forgotpassword
  //@access   public
  forgotPassword: asyncHandle(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(
        new ErrorResponse(
          `Không tồn tại tài khoản với email: ${req.body.email}`,
          404
        )
      );
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
      validateBeforeSave: false
    });

    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset/${resetToken}`;

    const message = `Bạn đã sử dụng tính năng quên mật khẩu. Vui lòng nhấn vào link ${url} để cập nhật lại mật khẩu.`;

    try {
      await sendMail({
        email: req.body.email,
        subject: "Quên mật khẩu ?",
        message,
      });

      res.status(200).json({
        success: true,
        data: 'Email sent'
      });
    } catch (err) {
      console.log(`Error send mail: ${err.message}`);
    }
  }),

  //@desc     Update password
  //@route    POST  api/auth/changepassword
  //@access   private
  updatePassword: asyncHandle(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if (!req.body.currentPassword) {
      return next(new ErrorResponse(`Bạn chưa nhập mật khẩu cũ.`, 401));
    }

    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return next(new ErrorResponse(`Mật khẩu cũ sai.`, 401));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
  }),

  //@desc     Update infor user
  //@route    PUT  api/auth/profile
  //@access   private
  updateProfile: asyncHandle(async (req, res, next) => {
    const { name, email } = req.body;
    let update;

    if (name) {
      update = { name };
    }

    if (email) {
      update = { email };
    }

    if (name && email) {
      update = {
        name,
        email,
      };
    }
    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  }),

  //@desc     Logout
  //@route    POST  api/auth/logout
  //@access   public
  logout: asyncHandle(async (req, res, next) => {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  }),
};
