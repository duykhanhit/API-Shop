const ErrorResponse = require('../utils/ErrorResponse');

const errorHandle = (err, req, res, next) => {
  
  let error = { ...err };

  error.message = err.message;

  // Log error
  console.log(err.stack);

  if(err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorResponse(message, 400);
  }

  if(err.code === 11000) {
    const message = 'Duplicate value.';
    error = new ErrorResponse(message, 400);
  }

  if(err.name === 'CastError') {
    const message = `Không tìm thấy giá trị với id: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  res.status(500).json({
    success: false,
    error: error.message
  })
}

module.exports = errorHandle;