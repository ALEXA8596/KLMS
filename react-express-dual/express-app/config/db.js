const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Atlas Connected');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;