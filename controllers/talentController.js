const { validationResult } = require('express-validator');
const Talent = require('../models/Talent');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get current talent profile
exports.getCurrentProfile = async (req, res) => {
  try {
    const talent = await Talent.findOne({ user: req.user.id })
      .populate('user', ['firstName', 'lastName', 'email']);

    if (!talent) {
      return res.status(400).json({ msg: 'Talent profile not found' });
    }

    res.json(talent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create or update talent profile
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    headline,
    city,
    state,
    country,
    skills,
    yearsOfExperience,
    biography,
    linkedin,
    github,
    portfolio,
    availability,
    isOpenToWork
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (headline) profileFields.headline = headline;
  if (yearsOfExperience) profileFields.yearsOfExperience = yearsOfExperience;
  if (biography) profileFields.biography = biography;
  if (availability) profileFields.availability = availability;
  if (isOpenToWork !== undefined) profileFields.isOpenToWork = isOpenToWork;

  // Build location object
  profileFields.location = {};
  if (city) profileFields.location.city = city;
  if (state) profileFields.location.state = state;
  if (country) profileFields.location.country = country;

  // Build social links object
  profileFields.socialLinks = {};
  if (linkedin) profileFields.socialLinks.linkedin = linkedin;
  if (github) profileFields.socialLinks.github = github;
  if (portfolio) profileFields.socialLinks.portfolio = portfolio;

  // Handle skills (convert comma separated string to array)
  if (skills) {
    profileFields.skills = Array.isArray(skills) 
      ? skills 
      : skills.split(',').map(skill => skill.trim());
  }

  try {
    let talent = await Talent.findOne({ user: req.user.id });

    if (talent) {
      // Update
      talent = await Talent.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(talent);
    }

    // Create
    talent = new Talent(profileFields);
    await talent.save();
    res.json(talent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add education to talent profile
exports.addEducation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    institution,
    degree,
    field,
    startDate,
    endDate,
    current
  } = req.body;

  const newEdu = {
    institution,
    degree,
    field,
    startDate,
    endDate,
    current: current || false
  };

  try {
    const talent = await Talent.findOne({ user: req.user.id });

    if (!talent) {
      return res.status(404).json({ msg: 'Talent profile not found' });
    }

    talent.education.unshift(newEdu);
    await talent.save();

    res.json(talent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add work experience to talent profile
exports.addExperience = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    company,
    position,
    description,
    startDate,
    endDate,
    current
  } = req.body;

  const newExp = {
    company,
    position,
    description,
    startDate,
    endDate,
    current: current || false
  };

  try {
    const talent = await Talent.findOne({ user: req.user.id });

    if (!talent) {
      return res.status(404).json({ msg: 'Talent profile not found' });
    }

    talent.workExperience.unshift(newExp);
    await talent.save();

    res.json(talent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove education from talent profile
exports.deleteEducation = async (req, res) => {
  try {
    const talent = await Talent.findOne({ user: req.user.id });

    if (!talent) {
      return res.status(404).json({ msg: 'Talent profile not found' });
    }

    // Get remove index
    const removeIndex = talent.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Education not found' });
    }

    talent.education.splice(removeIndex, 1);
    await talent.save();

    res.json(talent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove work experience from talent profile
exports.deleteExperience = async (req, res) => {
  try {
    const talent = await Talent.findOne({ user: req.user.id });

    if (!talent) {
      return res.status(404).json({ msg: 'Talent profile not found' });
    }

    // Get remove index
    const removeIndex = talent.workExperience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Experience not found' });
    }

    talent.workExperience.splice(removeIndex, 1);
    await talent.save();

    res.json(talent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Upload resume for talent
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const talent = await Talent.findOne({ user: req.user.id });

    if (!talent) {
      return res.status(404).json({ msg: 'Talent profile not found' });
    }

    // If there was a previous resume, delete it
    if (talent.resume && talent.resume.path) {
      const oldFilePath = path.join(__dirname, '..', talent.resume.path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    talent.resume = {
      filename: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      uploadDate: Date.now()
    };

    await talent.save();
    res.json(talent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get talent profile by ID
exports.getProfileById = async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.id)
      .populate('user', ['firstName', 'lastName', 'email']);

    if (!talent) {
      return res.status(404).json({ msg: 'Talent profile not found' });
    }

    // Increment profile views
    talent.profileViews += 1;
    await talent.save();

    res.json(talent);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Talent profile not found' });
    }
    res.status(500).send('Server error');
  }
}; 