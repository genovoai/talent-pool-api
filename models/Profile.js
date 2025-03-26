const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String
  },
  bio: {
    type: String
  },
  headline: {
    type: String
  },
  summary: {
    type: String
  },
  skills: {
    type: [String]
  },
  location: {
    type: String
  },
  yearsOfExperience: {
    type: Number
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  availability: {
    type: String
  },
  sponsorshipRequired: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  sponsorshipComments: {
    type: String
  },
  social: {
    linkedin: {
      type: String
    },
    github: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema); 