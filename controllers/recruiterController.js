const { validationResult } = require('express-validator');
const Talent = require('../models/Talent');
const Recruiter = require('../models/Recruiter');
const User = require('../models/User');

// Get current recruiter profile
exports.getCurrentProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user.id })
      .populate('user', ['firstName', 'lastName', 'email']);

    if (!recruiter) {
      return res.status(400).json({ msg: 'Recruiter profile not found' });
    }

    res.json(recruiter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create or update recruiter profile
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    company,
    position,
    industry,
    city,
    state,
    country,
    companyDescription,
    companyWebsite
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (position) profileFields.position = position;
  if (industry) profileFields.industry = industry;
  if (companyDescription) profileFields.companyDescription = companyDescription;
  if (companyWebsite) profileFields.companyWebsite = companyWebsite;

  // Build location object
  profileFields.location = {};
  if (city) profileFields.location.city = city;
  if (state) profileFields.location.state = state;
  if (country) profileFields.location.country = country;

  try {
    let recruiter = await Recruiter.findOne({ user: req.user.id });

    if (recruiter) {
      // Update
      recruiter = await Recruiter.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(recruiter);
    }

    // Create
    recruiter = new Recruiter(profileFields);
    await recruiter.save();
    res.json(recruiter);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Search for talent
exports.searchTalent = async (req, res) => {
  const {
    skills,
    location,
    yearsOfExperience,
    availability,
    isOpenToWork,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  // Add filters to query
  if (skills) {
    const skillsArray = skills.split(',').map(skill => skill.trim());
    query.skills = { $in: skillsArray };
  }

  if (location) {
    query['location.country'] = location;
  }

  if (yearsOfExperience) {
    query.yearsOfExperience = { $gte: parseInt(yearsOfExperience) };
  }

  if (availability) {
    query.availability = availability;
  }

  if (isOpenToWork !== undefined) {
    query.isOpenToWork = isOpenToWork === 'true';
  }

  // Save search query to recruiter's recent searches
  try {
    if (req.user) {
      const recruiter = await Recruiter.findOne({ user: req.user.id });
      if (recruiter) {
        recruiter.recentSearches.unshift({
          query: req.query,
          timestamp: Date.now()
        });

        // Limit to 10 recent searches
        if (recruiter.recentSearches.length > 10) {
          recruiter.recentSearches = recruiter.recentSearches.slice(0, 10);
        }

        await recruiter.save();
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with pagination
    const talents = await Talent.find(query)
      .populate('user', ['firstName', 'lastName'])
      .sort({ profileCompleteness: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Talent.countDocuments(query);

    res.json({
      talents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Shortlist a talent
exports.shortlistTalent = async (req, res) => {
  const { talentId, notes } = req.body;

  try {
    const recruiter = await Recruiter.findOne({ user: req.user.id });

    if (!recruiter) {
      return res.status(404).json({ msg: 'Recruiter profile not found' });
    }

    // Check if talent exists
    const talent = await Talent.findById(talentId);
    if (!talent) {
      return res.status(404).json({ msg: 'Talent not found' });
    }

    // Check if talent already shortlisted
    const alreadyShortlisted = recruiter.shortlistedTalent
      .filter(item => item.talent.toString() === talentId)
      .length > 0;

    if (alreadyShortlisted) {
      return res.status(400).json({ msg: 'Talent already shortlisted' });
    }

    // Add to shortlist
    recruiter.shortlistedTalent.unshift({
      talent: talentId,
      notes: notes || '',
      dateAdded: Date.now()
    });

    await recruiter.save();
    res.json(recruiter.shortlistedTalent);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Talent not found' });
    }
    res.status(500).send('Server error');
  }
};

// Remove talent from shortlist
exports.removeFromShortlist = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user.id });

    if (!recruiter) {
      return res.status(404).json({ msg: 'Recruiter profile not found' });
    }

    // Get remove index
    const removeIndex = recruiter.shortlistedTalent
      .map(item => item.id)
      .indexOf(req.params.shortlist_id);

    if (removeIndex === -1) {
      return res.status(404).json({ msg: 'Shortlisted talent not found' });
    }

    recruiter.shortlistedTalent.splice(removeIndex, 1);
    await recruiter.save();

    res.json(recruiter.shortlistedTalent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all shortlisted talent
exports.getShortlistedTalent = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user.id })
      .populate({
        path: 'shortlistedTalent.talent',
        select: 'headline location skills yearsOfExperience profileCompleteness',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });

    if (!recruiter) {
      return res.status(404).json({ msg: 'Recruiter profile not found' });
    }

    res.json(recruiter.shortlistedTalent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 