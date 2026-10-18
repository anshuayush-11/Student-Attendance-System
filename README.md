# Attendify - Student Attendance System

A modern, role-based Student Attendance Management System built with a responsive web frontend and a Node.js / Express / MongoDB backend.

---

## 🚀 Features

- **Role-Based Access Control (RBAC):**
  - **Teacher:** Mark daily attendance (Present / Absent / Late), view class rosters, launch attendance sessions, inspect compliance trends, and track at-risk students.
  - **Student:** View personal subject-wise attendance logs, monthly attendance matrix, and automated real-time compliance percentage calculations with threshold alerts.
- **Modern UI & Design System:**
  - Responsive layouts styled with external CSS (`styles.css`).
  - Google Fonts (Inter & Plus Jakarta Sans) and Material Symbols icons.
  - Visual color indicators for attendance thresholds (Green ≥80%, Yellow 60–80%, Red <60%).
- **Full Stack Integration:**
  - Centralized frontend API client (`api.js`) supporting JWT session storage and backend API endpoints.
  - RESTful Express API for authentication, class management, roster tracking, and attendance queries.
  - MongoDB database support (Local MongoDB or MongoDB Atlas Cloud).

---

## 📁 Project Structure

```text
├── Student-Attendance-System/          # Frontend Web Application
│   ├── index.html                      # Portal screen launcher
│   ├── login.html                      # Authentication portal (Teacher / Student)
│   ├── teacher-dashboard.html          # Teacher overview & quick session launcher
│   ├── mark-attendance.html            # Roll-call roster & batch marking tool
│   ├── attendance-records-analytics.html# Audit ledger & cohort analytics
│   ├── student-attendance-portal.html  # Student attendance tracking dashboard
│   ├── styles.css                      # Unified stylesheet for all screens
│   ├── api.js                          # Frontend API & JWT authentication client
│   └── logo.svg                        # Attendify brand icon
│
├── backend/                            # Node.js + Express REST API
│   ├── server.js                       # Main application entry point
│   ├── seed.js                         # Database seeder (sample teachers, students, classes)
│   ├── package.json                    # Backend dependencies & scripts
│   ├── .env.example                    # Environment variable template
│   ├── config/                         # Database connection configuration (db.js)
│   ├── middleware/                     # JWT authentication & role-verification middleware
│   ├── models/                         # Mongoose schemas (User, Class, Attendance)
│   └── routes/                         # Express API endpoints (auth, classes, attendance, students)
│
├── .gitignore                          # Root Git ignore rules
└── README.md                           # Documentation
```

---

## ⚙️ Setup & Running

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/attendify
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
```

Seed the database with sample data:

```bash
node seed.js
```

Start the backend server:

```bash
npm run dev
# or
node server.js
```

The API will run on `http://localhost:5000`.

### 2. Frontend Setup

Open any HTML file inside `Student-Attendance-System/` in a modern browser or serve via Live Server:
- `Student-Attendance-System/login.html` (Login screen)
- `Student-Attendance-System/teacher-dashboard.html` (Teacher dashboard)
- `Student-Attendance-System/mark-attendance.html` (Mark attendance)
- `Student-Attendance-System/attendance-records-analytics.html` (Analytics)
- `Student-Attendance-System/student-attendance-portal.html` (Student portal)

---

## 🔐 Default Demo Accounts (from `seed.js`)

| Role | Email | Password |
|---|---|---|
| **Teacher** | `sarah.jenkins@university.edu` | `teacher123` |
| **Student** | `alex.chen@university.edu` | `student123` |

---

## 📄 License
ISC License
