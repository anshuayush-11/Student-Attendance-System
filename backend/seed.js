/**
 * Seed script — creates demo users and a sample class in MongoDB.
 * Run once:  node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});

    // ── Create Teacher ──────────────────────────────────────────
    const teacher = await User.create({
      name: 'Dr. Elena Vance',
      email: 'teacher@attendify.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science',
    });
    console.log(`👩‍🏫 Teacher created: ${teacher.email}`);

    // ── Create Students ─────────────────────────────────────────
    const studentsData = [
      { name: 'Aarav Sharma',    rollNumber: 'BCA-101', email: 'aarav@attendify.edu' },
      { name: 'Priya Singh',     rollNumber: 'BCA-102', email: 'priya@attendify.edu' },
      { name: 'Devansh Patel',   rollNumber: 'BCA-103', email: 'devansh@attendify.edu' },
      { name: 'Marcus Brody',    rollNumber: 'BCA-104', email: 'marcus@attendify.edu' },
      { name: 'Ananya Iyer',     rollNumber: 'BCA-105', email: 'ananya@attendify.edu' },
      { name: 'Rohan Gupta',     rollNumber: 'BCA-106', email: 'rohan@attendify.edu' },
      { name: 'Sara Al-Mansoor', rollNumber: 'BCA-107', email: 'sara@attendify.edu' },
      // The first student also gets the demo login
      { name: 'Anshu Ayush',     rollNumber: 'BCA-2024-042', email: 'student@attendify.edu' },
    ];

    const students = await User.create(
      studentsData.map((s) => ({
        ...s,
        password: 'password123',
        role: 'student',
        course: 'BCA',
        year: 1,
        section: 'A',
      }))
    );
    console.log(`🎓 ${students.length} students created`);

    // ── Create a Class ──────────────────────────────────────────
    const cls = await Class.create({
      name: 'BCA - 1st Year (Section A)',
      course: 'Data Structures & Algorithms',
      courseCode: 'CS-201',
      teacher: teacher._id,
      students: students.map((s) => s._id),
      academicTerm: 'Fall 2026',
      schedule: { day: 'Monday', startTime: '09:00', endTime: '10:15', room: 'Room 402' },
    });
    console.log(`📚 Class created: ${cls.name} (${cls.courseCode})`);

    console.log('\n🎉 Seed complete! Demo credentials:');
    console.log('  Teacher : teacher@attendify.edu / password123');
    console.log('  Student : student@attendify.edu / password123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
