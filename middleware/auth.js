const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Check if user is a recruiter
const recruiter = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === 'recruiter' || req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied. Recruiter role required.' });
    }
  });
};

// Check if user is a talent
const talent = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === 'talent' || req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied. Talent role required.' });
    }
  });
};

// Check if user is an admin
const admin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied. Admin role required.' });
    }
  });
};

module.exports = { auth, recruiter, talent, admin }; 