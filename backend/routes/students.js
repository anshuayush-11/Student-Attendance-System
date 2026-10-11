const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/students
// @desc    Get all students (optionally filter by course/section)
// @access  Private (teacher/admin)
router.get('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const filter = { role: 'student' };
    if (req.query.course) filter.course = req.query.course;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.year) filter.year = req.query.year;

    const students = await User.find(filter).select('-password').sort({ rollNumber: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get a single student's profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
