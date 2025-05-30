const mongoose = require("mongoose")

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongodb connected succesfully")
    }catch(err){
      console.log("connection failed due to", err.message);
      process.exit(1);
    }
};
module.exports = connectDB;