const mongoose= require("mongoose");
const mongoDBPass=process.env.MONGO_DB_PASS;

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://devb2005:${process.env.MONGO_DB_PASS}@cluster0.oqdbe.mongodb.net/text-editor`
    );
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = { connectDB };
