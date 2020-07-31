const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Bạn chưa nhập tên."],
  },
  email: {
    type: String,
    required: [true, "Bạn chưa nhập email."],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Nhập sai định dạng email.",
    ],
  },
  password: {
    type: String,
    required: [true, "Bạn chưa nhập mật khẩu."],
    minlength: [6, "Mật khẩu vừa nhập ngắn hơn 6 thứ tự."],
    select: false,
  },
  role: {
    type: String,
    enum: ["member", "mod", "admin"],
    default: "member",
  },
  avatar: {
    type: String,
    default: "avatar.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  boughted: {
    type: [],
    default: undefined,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.resetPasswordExpire = Date.now() + 10*60*1000;

  return resetToken;

}
module.exports = mongoose.model("Users", UserSchema);
