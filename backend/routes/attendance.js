const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/attendance
// @desc    Mark attendance for a session
// @access  Private (teacher)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  const { classId, date, period, records } = req.body;
  // records: [{ student: id, status: 'present'|'absent'|'late', remark }]

  try {
    // Prevent duplicate marking for same class + date + period
    const existing = await Attendance.findOne({
      class: classId,
      date: new Date(date),
      period,
    });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this session' });
    }

    const attendance = await Attendance.create({
      class: classId,
      date: new Date(date),
      period,
      markedBy: req.user._id,
      records,
    });

    await attendance.populate('class', 'name courseCode');
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update/edit an attendance record
// @access  Private (teacher)
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { records: req.body.records },
      { new: true, runValidators: true }
    );
    if (!attendance) return res.status(404).json({ message: 'Record not found' });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/attendance/class/:classId
// @desc    Get all attendance records for a class
// @access  Private
router.get('/class/:classId', protect, async (req, res) => {
  try {
    const { from, to } = req.query; // optional date filters
    const filter = { class: req.params.classId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('markedBy', 'name')
      .populate('records.student', 'name rollNumber');

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get attendance summary for a specific student across all their classes
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    // Find all classes this student is enrolled in
    const classes = await Class.find({ students: req.params.studentId });
    const classIds = classes.map((c) => c._id);

    // Aggregate attendance by class
    const summary = await Attendance.aggregate([
      { $match: { class: { $in: classIds } } },
      { $unwind: '$records' },
      { $match: { 'records.student': require('mongoose').Types.ObjectId.createFromHexString(req.params.studentId) } },
      {
        $group: {
          _id: '$class',
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ['$records.status', 'late'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      {
        $project: {
          className: '$classInfo.name',
          course: '$classInfo.course',
          courseCode: '$classInfo.courseCode',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          percentage: {
            $round: [
              { $multiply: [{ $divide: ['$present', '$total'] }, 100] },
              1,
            ],
          },
        },
      },
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/attendance/analytics/:classId
// @desc    Get class-level analytics (avg, top/bottom student, threshold breach)
// @access  Private (teacher)
router.get('/analytics/:classId', protect, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId).populate('students', 'name rollNumber');
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const records = await Attendance.find({ class: req.params.classId });
    const totalSessions = records.length;

    // Per-student count
    const studentStats = {};
    cls.students.forEach((s) => {
      studentStats[s._id.toString()] = {
        student: { _id: s._id, name: s.name, rollNumber: s.rollNumber },
        present: 0, absent: 0, late: 0,
      };
    });

    records.forEach((session) => {
      session.records.forEach((r) => {
        const key = r.student.toString();
        if (studentStats[key]) {
          studentStats[key][r.status]++;
        }
      });
    });

    const statsArray = Object.values(studentStats).map((s) => ({
      ...s,
      total: totalSessions,
      percentage: totalSessions
        ? +((s.present / totalSessions) * 100).toFixed(1)
        : 0,
    }));

    const belowThreshold = statsArray.filter((s) => s.percentage < 75);
    const avgPercentage = statsArray.length
      ? +(statsArray.reduce((a, b) => a + b.percentage, 0) / statsArray.length).toFixed(1)
      : 0;

    res.json({
      totalSessions,
      avgPercentage,
      belowThreshold,
      studentStats: statsArray,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
