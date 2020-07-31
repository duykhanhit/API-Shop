const mongoose = require('mongoose');
const color = require('colors');

const connectDB = async () => {
  const conn = await mongoose.connect(
    process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  );

  console.log(`MongoDB connected: ${conn.connection.host}`.rainbow.bold);
}

module.exports = connectDB;