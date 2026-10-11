const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String, // e.g. "Period 3 (10:00 - 10:55 AM)"
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // teacher who marked
      required: true,
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late'],
          required: true,
        },
        remark: {
          type: String,
          default: '',
        },
      },
    ],
    // Computed summary (auto-calculated)
    summary: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Auto-compute summary before saving
attendanceSchema.pre('save', async function () {
  const records = this.records;
  this.summary.total   = records.length;
  this.summary.present = records.filter((r) => r.status === 'present').length;
  this.summary.absent  = records.filter((r) => r.status === 'absent').length;
  this.summary.late    = records.filter((r) => r.status === 'late').length;
});

module.exports = mongoose.model('Attendance', attendanceSchema);
