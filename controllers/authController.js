const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Talent = require('../models/Talent');
const Recruiter = require('../models/Recruiter');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, role, country, company, position } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      country,
      company,
      position
    });

    await user.save();

    // Create corresponding profile based on role
    if (user.role === 'talent') {
      const talent = new Talent({
        user: user._id,
        location: {
          country: country || ''
        }
      });
      await talent.save();
    } else if (user.role === 'recruiter') {
      const recruiter = new Recruiter({
        user: user._id,
        company: company || '',
        position: position || '',
        location: {
          country: country || ''
        }
      });
      await recruiter.save();
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check if role matches (if provided)
    if (role && user.role !== role) {
      return res.status(400).json({ msg: 'Invalid account type for this email' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 