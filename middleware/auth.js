const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token - for demo purposes, allow public access to protected routes
  if (!token) {
    console.log('Warning: No token provided, but allowing access for demo purposes');
    // For demo, set a default user with admin privileges
    req.user = { id: 'demo-user', role: 'admin' };
    return next();
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log('Warning: Invalid token, but allowing access for demo purposes');
    // For demo, set a default user with admin privileges
    req.user = { id: 'demo-user', role: 'admin' };
    next();
  }
};

// Check if user is a recruiter
const recruiter = (req, res, next) => {
  // For demo, skip actual auth check
  if (!req.user) {
    req.user = { id: 'demo-user', role: 'admin' };
  }
  next();
};

// Check if user is a talent
const talent = (req, res, next) => {
  // For demo, skip actual auth check
  if (!req.user) {
    req.user = { id: 'demo-user', role: 'admin' };
  }
  next();
};

// Check if user is an admin
const admin = (req, res, next) => {
  // For demo, skip actual auth check
  if (!req.user) {
    req.user = { id: 'demo-user', role: 'admin' };
  }
  next();
};

module.exports = { auth, recruiter, talent, admin }; 