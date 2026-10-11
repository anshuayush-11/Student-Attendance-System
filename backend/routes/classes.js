const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/classes
// @desc    Get all classes for logged-in teacher
// @access  Private (teacher/admin)
router.get('/', protect, async (req, res) => {
  try {
    let classes;
    if (req.user.role === 'teacher') {
      classes = await Class.find({ teacher: req.user._id }).populate('students', 'name rollNumber email');
    } else if (req.user.role === 'student') {
      classes = await Class.find({ students: req.user._id }).populate('teacher', 'name email');
    } else {
      classes = await Class.find().populate('teacher', 'name').populate('students', 'name rollNumber');
    }
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private (teacher/admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const cls = await Class.create({ ...req.body, teacher: req.user._id });
    res.status(201).json(cls);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/classes/:id
// @desc    Get single class with students
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('teacher', 'name email department')
      .populate('students', 'name email rollNumber section');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/classes/:id/students
// @desc    Add/remove students from a class
// @access  Private (teacher/admin)
router.put('/:id/students', protect, authorize('teacher', 'admin'), async (req, res) => {
  const { studentIds, action } = req.body; // action: 'add' | 'remove'
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    if (action === 'add') {
      cls.students.addToSet(...studentIds);
    } else {
      cls.students = cls.students.filter(
        (id) => !studentIds.includes(id.toString())
      );
    }
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
