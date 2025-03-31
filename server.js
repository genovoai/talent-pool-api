const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set up middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Configure CORS - Allow all origins in development
app.use(cors({
  origin: '*', // Allow all origins temporarily for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint that doesn't require DB
app.get('/api/health', (req, res) => {
  res.json({ 
    msg: 'API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    db_status: global.mongoConnected ? 'connected' : 'not connected'
  });
});

// Database connection middleware
app.use(async (req, res, next) => {
  // Skip DB connection for health check
  if (req.path === '/api/health') {
    return next();
  }

  try {
    if (!global.mongoConnected) {
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      global.mongoConnected = true;
    }
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Require models (order matters)
require('./models/User');
require('./models/Profile');

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/talent', require('./routes/talent'));
app.use('/api/recruiter', require('./routes/recruiter'));
app.use('/api/profile', require('./routes/api/profile'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      code: err.code
    } : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Define port
const PORT = process.env.PORT || 5050;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack
  });
  // Don't exit the process in production
  if (process.env.NODE_ENV !== 'production') {
    server.close(() => process.exit(1));
  }
}); 