const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const recruiterController = require('../controllers/recruiterController');
const { auth, recruiter } = require('../middleware/auth');

// @route   GET api/recruiter/me
// @desc    Get current recruiter profile
// @access  Private (recruiter only)
router.get('/me', recruiter, recruiterController.getCurrentProfile);

// @route   POST api/recruiter
// @desc    Create or update recruiter profile
// @access  Private (recruiter only)
router.post(
  '/',
  [
    recruiter,
    [
      check('company', 'Company is required').not().isEmpty(),
      check('position', 'Position is required').not().isEmpty(),
      check('country', 'Country is required').optional().not().isEmpty()
    ]
  ],
  recruiterController.updateProfile
);

// @route   GET api/recruiter/search
// @desc    Search for talent
// @access  Private (recruiter only)
router.get('/search', recruiter, recruiterController.searchTalent);

// @route   POST api/recruiter/shortlist
// @desc    Add talent to shortlist
// @access  Private (recruiter only)
router.post(
  '/shortlist',
  [
    recruiter,
    [
      check('talentId', 'Talent ID is required').not().isEmpty()
    ]
  ],
  recruiterController.shortlistTalent
);

// @route   DELETE api/recruiter/shortlist/:shortlist_id
// @desc    Remove talent from shortlist
// @access  Private (recruiter only)
router.delete('/shortlist/:shortlist_id', recruiter, recruiterController.removeFromShortlist);

// @route   GET api/recruiter/shortlist
// @desc    Get all shortlisted talent
// @access  Private (recruiter only)
router.get('/shortlist', recruiter, recruiterController.getShortlistedTalent);

module.exports = router; 