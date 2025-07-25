const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/images
// @desc    Upload an image to a folder
// @access  Private
router.post('/', auth, upload.single('image'), [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Image name must be between 1 and 200 characters'),
  body('folderId')
    .isMongoId()
    .withMessage('Invalid folder ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { name, folderId } = req.body;

    // Verify folder exists and belongs to user
    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.user._id
    });

    if (!folder) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Create image record
    const image = new Image({
      name,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      userId: req.user._id,
      folderId: folder._id
    });

    await image.save();
    await image.populate('folderId', 'name path');

    res.status(201).json({
      message: 'Image uploaded successfully',
      image
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error uploading image' });
  }
});

// @route   GET /api/images
// @desc    Get images for a specific folder or all folders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { folderId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let imageQuery = { userId: req.user._id };
    let countQuery = { userId: req.user._id };

    // If folderId is provided, filter by specific folder
    if (folderId) {
      // Verify folder exists and belongs to user
      const folder = await Folder.findOne({
        _id: folderId,
        userId: req.user._id
      });

      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }

      imageQuery.folderId = folder._id;
      countQuery.folderId = folder._id;
    }
    // If no folderId provided, get images from all folders

    const images = await Image.find(imageQuery)
      .populate('folderId', 'name path')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Image.countDocuments(countQuery);

    res.json({
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Error fetching images' });
  }
});

// @route   GET /api/images/search
// @desc    Search images by name
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { query, folderId, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = {
      userId: req.user._id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { originalName: { $regex: query, $options: 'i' } }
      ]
    };

    // If folderId is provided, search only in that folder and its subfolders
    if (folderId) {
      const folder = await Folder.findOne({
        _id: folderId,
        userId: req.user._id
      });

      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }

      // Get all subfolder IDs recursively
      const getAllSubfolderIds = async (parentId) => {
        const subfolders = await Folder.find({ 
          parentFolder: parentId, 
          userId: req.user._id 
        }).select('_id');
        
        let allIds = [parentId];
        for (const subfolder of subfolders) {
          const subIds = await getAllSubfolderIds(subfolder._id);
          allIds = allIds.concat(subIds);
        }
        return allIds;
      };

      const folderIds = await getAllSubfolderIds(folder._id);
      searchFilter.folderId = { $in: folderIds };
    }

    const images = await Image.find(searchFilter)
      .populate('folderId', 'name path')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Image.countDocuments(searchFilter);

    res.json({
      images,
      query: query.trim(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search images error:', error);
    res.status(500).json({ message: 'Error searching images' });
  }
});

// @route   GET /api/images/:id
// @desc    Get a specific image
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('folderId', 'name path');

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ image });
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: 'Error fetching image' });
  }
});

// @route   PUT /api/images/:id
// @desc    Update image name
// @access  Private
router.put('/:id', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Image name must be between 1 and 200 characters')
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

    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    image.name = name;
    await image.save();
    await image.populate('folderId', 'name path');

    res.json({
      message: 'Image updated successfully',
      image
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ message: 'Error updating image' });
  }
});

// @route   DELETE /api/images/:id
// @desc    Delete an image
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(image.filepath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Image.findByIdAndDelete(image._id);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

// @route   POST /api/images/:id/move
// @desc    Move an image to a different folder
// @access  Private
router.post('/:id/move', auth, [
  body('folderId')
    .isMongoId()
    .withMessage('Invalid folder ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { folderId } = req.body;

    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Verify destination folder exists and belongs to user
    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Destination folder not found' });
    }

    image.folderId = folder._id;
    await image.save();
    await image.populate('folderId', 'name path');

    res.json({
      message: 'Image moved successfully',
      image
    });
  } catch (error) {
    console.error('Move image error:', error);
    res.status(500).json({ message: 'Error moving image' });
  }
});

module.exports = router;
