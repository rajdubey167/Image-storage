const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [100, 'Folder name cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  path: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create compound index for unique folder names within the same parent and user
folderSchema.index({ name: 1, parentFolder: 1, userId: 1 }, { unique: true });

// Pre-save middleware to generate path
folderSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('parentFolder') || this.isModified('name')) {
    try {
      if (this.parentFolder) {
        const parentFolder = await this.constructor.findById(this.parentFolder);
        if (parentFolder && parentFolder.path) {
          this.path = `${parentFolder.path}/${this.name}`;
        } else {
          this.path = this.name;
        }
      } else {
        this.path = this.name;
      }
    } catch (error) {
      console.error('Error generating folder path:', error);
      this.path = this.name; // Fallback to just the name
    }
  }
  next();
});

// Method to get all subfolders
folderSchema.methods.getSubfolders = function() {
  return this.constructor.find({ parentFolder: this._id, userId: this.userId });
};

// Static method to get folder tree for a user
folderSchema.statics.getFolderTree = async function(userId, parentFolder = null) {
  const folders = await this.find({ userId, parentFolder })
    .populate('parentFolder', 'name')
    .sort({ name: 1 });
  
  const folderTree = [];
  
  for (const folder of folders) {
    const subfolders = await this.getFolderTree(userId, folder._id);
    folderTree.push({
      ...folder.toObject(),
      subfolders
    });
  }
  
  return folderTree;
};

module.exports = mongoose.model('Folder', folderSchema);
