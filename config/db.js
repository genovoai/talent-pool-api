const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the MongoDB Atlas URI from environment variables
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('MongoDB URI not found in environment variables');
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI format check:', mongoURI.startsWith('mongodb+srv://') ? 'Valid Atlas URI' : 'Invalid URI format');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    
    // Add connection error handlers
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;

  } catch (err) {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    if (err.name === 'MongoServerSelectionError') {
      console.error('Failed to connect to MongoDB server. Please check:');
      console.error('1. Network connectivity');
      console.error('2. MongoDB Atlas whitelist settings');
      console.error('3. Database user credentials');
    }
    
    throw err; // Let the server handle the error
  }
};

module.exports = connectDB; 