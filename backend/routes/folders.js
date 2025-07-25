const express = require('express');
const { body, validationResult } = require('express-validator');
const Folder = require('../models/Folder');
const Image = require('../models/Image');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/folders
// @desc    Create a new folder
// @access  Private
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Folder name must be between 1 and 100 characters')
    .matches(/^[^<>:"/\\|?*]+$/)
    .withMessage('Folder name contains invalid characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, parentFolder } = req.body;

    // Validate parent folder if provided
    if (parentFolder) {
      const parent = await Folder.findOne({
        _id: parentFolder,
        userId: req.user._id
      });
      if (!parent) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
    }

    // Check if folder with same name already exists in the same parent
    const existingFolder = await Folder.findOne({
      name,
      userId: req.user._id,
      parentFolder: parentFolder || null
    });

    if (existingFolder) {
      return res.status(400).json({
        message: 'A folder with this name already exists in the selected location'
      });
    }

    console.log('Creating folder:', { name, userId: req.user._id, parentFolder: parentFolder || null });
    
    const folder = new Folder({
      name,
      userId: req.user._id,
      parentFolder: parentFolder || null
    });

    console.log('Folder object before save:', folder);
    await folder.save();
    console.log('Folder saved successfully:', folder);
    
    await folder.populate('parentFolder', 'name path');

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A folder with this name already exists in the selected location'
      });
    }
    res.status(500).json({ message: 'Error creating folder' });
  }
});

// @route   GET /api/folders
// @desc    Get all folders for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { parentFolder } = req.query;
    
    const query = {
      userId: req.user._id,
      parentFolder: parentFolder || null
    };

    const folders = await Folder.find(query)
      .populate('parentFolder', 'name path')
      .sort({ name: 1 });

    res.json({
      folders
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ message: 'Error fetching folders' });
  }
});

// @route   GET /api/folders/tree
// @desc    Get folder tree for the authenticated user
// @access  Private
router.get('/tree', auth, async (req, res) => {
  try {
    const folderTree = await Folder.getFolderTree(req.user._id);
    res.json({
      folderTree
    });
  } catch (error) {
    console.error('Get folder tree error:', error);
    res.status(500).json({ message: 'Error fetching folder tree' });
  }
});

// @route   GET /api/folders/:id
// @desc    Get a specific folder with its contents
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('parentFolder', 'name path');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Get subfolders
    const subfolders = await Folder.find({
      parentFolder: folder._id,
      userId: req.user._id
    }).sort({ name: 1 });

    // Get images in this folder
    const images = await Image.find({
      folderId: folder._id,
      userId: req.user._id
    }).sort({ name: 1 });

    res.json({
      folder: {
        ...folder.toObject(),
        subfolders,
        images
      }
    });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({ message: 'Error fetching folder' });
  }
});

// @route   PUT /api/folders/:id
// @desc    Update a folder
// @access  Private
router.put('/:id', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Folder name must be between 1 and 100 characters')
    .matches(/^[^<>:"/\\|?*]+$/)
    .withMessage('Folder name contains invalid characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name } = req.body;

    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if folder with same name already exists in the same parent
    const existingFolder = await Folder.findOne({
      name,
      userId: req.user._id,
      parentFolder: folder.parentFolder,
      _id: { $ne: folder._id }
    });

    if (existingFolder) {
      return res.status(400).json({
        message: 'A folder with this name already exists in the same location'
      });
    }

    folder.name = name;
    await folder.save();
    await folder.populate('parentFolder', 'name path');

    res.json({
      message: 'Folder updated successfully',
      folder
    });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ message: 'Error updating folder' });
  }
});

// @route   DELETE /api/folders/:id
// @desc    Delete a folder and all its contents
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Get all subfolders recursively
    const getAllSubfolders = async (folderId) => {
      const subfolders = await Folder.find({ parentFolder: folderId, userId: req.user._id });
      let allIds = [folderId];
      
      for (const subfolder of subfolders) {
        const subIds = await getAllSubfolders(subfolder._id);
        allIds = allIds.concat(subIds);
      }
      
      return allIds;
    };

    const folderIds = await getAllSubfolders(folder._id);

    // Delete all images in these folders
    await Image.deleteMany({
      folderId: { $in: folderIds },
      userId: req.user._id
    });

    // Delete all folders
    await Folder.deleteMany({
      _id: { $in: folderIds },
      userId: req.user._id
    });

    res.json({ message: 'Folder and all its contents deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Error deleting folder' });
  }
});

module.exports = router;
