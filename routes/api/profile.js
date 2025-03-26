const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

// Models
const Profile = mongoose.model('Profile');
const User = mongoose.model('User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['firstName', 'lastName', 'email', 'role']);

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    title,
    bio,
    headline,
    summary,
    skills,
    location,
    yearsOfExperience,
    phone,
    website,
    availability,
    sponsorshipRequired,
    sponsorshipComments,
    social
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (title) profileFields.title = title;
  if (bio) profileFields.bio = bio;
  if (headline) profileFields.headline = headline;
  if (summary) profileFields.summary = summary;
  if (skills) profileFields.skills = skills;
  if (location) profileFields.location = location;
  if (yearsOfExperience) profileFields.yearsOfExperience = yearsOfExperience;
  if (phone) profileFields.phone = phone;
  if (website) profileFields.website = website;
  if (availability) profileFields.availability = availability;
  if (sponsorshipRequired) profileFields.sponsorshipRequired = sponsorshipRequired;
  if (sponsorshipComments) profileFields.sponsorshipComments = sponsorshipComments;

  // Build social object
  profileFields.social = {};
  if (social && social.linkedin) profileFields.social.linkedin = social.linkedin;
  if (social && social.github) profileFields.social.github = social.github;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json(profile);
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['firstName', 'lastName', 'email', 'role']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['firstName', 'lastName', 'email', 'role']);

    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 