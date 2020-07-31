const jwt = require('jsonwebtoken');
const asyncHanle = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

module.exports = {
  protect: asyncHanle( async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bear')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
      return next(new ErrorResponse(`Bạn không có quyền truy cập.`, 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);
      next();

    } catch (err) {
      return next(new ErrorResponse(`Bạn không có quyền truy cập.`, 401));
    }
  }),
  authorize: (...role) => {
    return (req, res, next) => {
      if(!role.includes(req.user.role)) {
        return next( new ErrorResponse(`Bạn không có quyền truy cập.`, 403));
      }
      next();
    }
  }
}