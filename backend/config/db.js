// db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const uri = "mongodb+srv://abhisheksingh4311:nagpur420@cluster0.3szbikd.mongodb.net/";
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB!`);
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error.message}`);
    }
};

module.exports = connectDB;
