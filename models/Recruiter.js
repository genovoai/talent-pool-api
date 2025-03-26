const mongoose = require('mongoose');

const RecruiterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      required: true
    }
  },
  companyDescription: {
    type: String,
    trim: true
  },
  companyWebsite: {
    type: String,
    trim: true
  },
  companyLogo: {
    type: String
  },
  shortlistedTalent: [{
    talent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Talent'
    },
    notes: {
      type: String,
      trim: true
    },
    dateAdded: {
      type: Date,
      default: Date.now
    }
  }],
  recentSearches: [{
    query: {
      type: Object
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Recruiter', RecruiterSchema); 