const mongoose = require('mongoose');

const TalentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  headline: {
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
  skills: [{
    type: String,
    trim: true
  }],
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  biography: {
    type: String,
    trim: true
  },
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      trim: true
    },
    field: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    }
  }],
  workExperience: [{
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
    description: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    }
  }],
  resume: {
    filename: {
      type: String
    },
    path: {
      type: String
    },
    mimetype: {
      type: String
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  profileViews: {
    type: Number,
    default: 0
  },
  profileCompleteness: {
    type: Number,
    default: 0
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    portfolio: {
      type: String,
      trim: true
    }
  },
  availability: {
    type: String,
    enum: ['immediate', 'two_weeks', 'month', 'negotiable'],
    default: 'negotiable'
  },
  isOpenToWork: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Calculate profile completeness before saving
TalentSchema.pre('save', function(next) {
  const requiredFields = [
    'headline', 
    'location.country', 
    'skills', 
    'yearsOfExperience', 
    'biography', 
    'education', 
    'workExperience', 
    'resume.path'
  ];
  
  let completedFields = 0;
  
  requiredFields.forEach(field => {
    const fieldValue = field.split('.').reduce((obj, path) => {
      return obj ? obj[path] : null;
    }, this);
    
    if (Array.isArray(fieldValue) && fieldValue.length > 0) {
      completedFields++;
    } else if (fieldValue && !Array.isArray(fieldValue)) {
      completedFields++;
    }
  });
  
  this.profileCompleteness = Math.round((completedFields / requiredFields.length) * 100);
  next();
});

module.exports = mongoose.model('Talent', TalentSchema); 