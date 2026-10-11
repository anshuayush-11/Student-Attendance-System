const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // e.g. "BCA - 1st Year (Section A)"
    },
    course: {
      type: String,
      required: true,
      // e.g. "CS-201: Data Structures & Algorithms"
    },
    courseCode: {
      type: String,
      required: true,
      // e.g. "CS-201"
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    academicTerm: {
      type: String,
      default: 'Fall 2026',
    },
    schedule: {
      // e.g. { day: "Monday", startTime: "09:00", endTime: "10:15", room: "Room 402" }
      day: String,
      startTime: String,
      endTime: String,
      room: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
