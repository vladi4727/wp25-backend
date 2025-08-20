// const uri = process.env.MONGO_URI || "mongodb://localhost:27017/myDatabase";

const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;

module.exports = function connectDB() {
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Mongo error: ", err));
};
