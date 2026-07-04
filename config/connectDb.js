const mongoose = require("mongoose");
const colors = require("colors");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`.bgGreen.black
    );
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`.bgRed.white);
    process.exit(1);
  }
};

module.exports = connectDb;