const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const talentController = require('../controllers/talentController');
const { auth, talent } = require('../middleware/auth');

// Set up file storage for resumes
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/resumes');
  },
  filename: function(req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
const checkFileType = (file, cb) => {
  // Allowed extensions
  const filetypes = /pdf|doc|docx/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Resume must be PDF, DOC, or DOCX');
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// @route   GET api/talent/me
// @desc    Get current talent profile
// @access  Private (talent only)
router.get('/me', talent, talentController.getCurrentProfile);

// @route   POST api/talent
// @desc    Create or update talent profile
// @access  Private (talent only)
router.post(
  '/',
  [
    talent,
    [
      check('headline', 'Headline is required').optional(),
      check('country', 'Country is required').optional().not().isEmpty()
    ]
  ],
  talentController.updateProfile
);

// @route   POST api/talent/education
// @desc    Add education to profile
// @access  Private (talent only)
router.post(
  '/education',
  [
    talent,
    [
      check('institution', 'Institution is required').not().isEmpty(),
      check('degree', 'Degree is required').optional(),
      check('field', 'Field of study is required').optional()
    ]
  ],
  talentController.addEducation
);

// @route   DELETE api/talent/education/:edu_id
// @desc    Delete education from profile
// @access  Private (talent only)
router.delete('/education/:edu_id', talent, talentController.deleteEducation);

// @route   POST api/talent/experience
// @desc    Add experience to profile
// @access  Private (talent only)
router.post(
  '/experience',
  [
    talent,
    [
      check('company', 'Company is required').not().isEmpty(),
      check('position', 'Position is required').not().isEmpty(),
      check('startDate', 'Start date is required').not().isEmpty()
    ]
  ],
  talentController.addExperience
);

// @route   DELETE api/talent/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private (talent only)
router.delete('/experience/:exp_id', talent, talentController.deleteExperience);

// @route   POST api/talent/upload-resume
// @desc    Upload resume
// @access  Private (talent only)
router.post(
  '/upload-resume',
  talent,
  upload.single('resume'),
  talentController.uploadResume
);

// @route   GET api/talent/:id
// @desc    Get talent profile by ID
// @access  Private (authenticated users)
router.get('/:id', auth, talentController.getProfileById);

module.exports = router; 