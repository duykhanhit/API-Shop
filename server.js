const express = require('express');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const color = require('colors');
const connectDB = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require("express-rate-limit");

dotenv.config({path: './config/config.env'});

connectDB();

// Import middlewares
const morgan = require('morgan');
const errorHandle = require('./middlewares/error');

const app = express();

// Import routes
const products = require('./routes/product');
const categories = require('./routes/category');
const auth = require('./routes/auth');

// Body parser
app.use(express.json());
app.use(cookieParser());

app.use(fileUpload());

// Protect
app.use(cors());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

// Set limiter request
const limiter = rateLimit({
  windowMs: 10*60*1000,
  max: 50
});
app.use(limiter);

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello new API shop');
});

app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/auth', auth);

app.use(errorHandle);

const server = app.listen(
  PORT,
  () => console.log(`Server running on PORT ${PORT}`.yellow.bold)
);

// Handle unhandle Promise Rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  //Close server
  server.close(() => process.exit(1));
});
