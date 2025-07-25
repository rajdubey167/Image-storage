const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Image name is required'],
    trim: true,
    maxlength: [200, 'Image name cannot exceed 200 characters']
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  filepath: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(v);
      },
      message: 'Only image files are allowed'
    }
  },
  size: {
    type: Number,
    required: true,
    max: [10 * 1024 * 1024, 'Image size cannot exceed 10MB'] // 10MB limit
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster searching
imageSchema.index({ name: 'text', originalName: 'text' });
imageSchema.index({ userId: 1, folderId: 1 });

// Virtual for image URL
imageSchema.virtual('url').get(function() {
  return `/uploads/${this.filename}`;
});

// Ensure virtual fields are serialized
imageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Image', imageSchema);
