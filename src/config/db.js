const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected Successfully hii: ${conn.connection.host}`);
    } 
    catch (error) {
        console.error(`MongoDB Connected Failed . Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
