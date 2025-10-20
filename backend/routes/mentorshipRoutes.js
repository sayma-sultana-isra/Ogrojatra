import express from 'express';
<<<<<<< HEAD
import multer from 'multer'; // ✅ NEW for file uploads
import path from 'path';
=======
>>>>>>> my-extra-files
import {
  createMentorshipProgram,
  getAlumniPrograms,
  getAllPrograms,
  enrollInProgram,
  getProgramDetails,
  addProgramContent,
  getProgramContent,
<<<<<<< HEAD
  updateMentorshipProgram,
  getAdminMentorshipPrograms,
  getStudentEnrolledProgram
} from '../controllers/mentorshipController.js';
import {
  createSession,        // ✅ NEW
  getSessions,          // ✅ NEW
  updateSessionStatus   // ✅ NEW
} from '../controllers/mentorshipSessionController.js'; // ✅ NEW file
=======
  downloadContent,
  deleteProgramContent,
  updateMentorshipProgram,
  getAdminMentorshipPrograms,
  getStudentEnrolledProgram,
  deleteMentorshipProgram,
  upload
} from '../controllers/mentorshipController.js';
import {
  createSession,
  getSessions,
  updateSessionStatus
} from '../controllers/mentorshipSessionController.js';
>>>>>>> my-extra-files
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

<<<<<<< HEAD
// ✅ NEW: Setup file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/mentorship/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

=======
>>>>>>> my-extra-files
// All routes require authentication
router.use(protect);

// Student routes
router.get('/programs', authorize('student', 'admin', 'alumni'), getAllPrograms);
router.get('/student/my-program', authorize('student'), getStudentEnrolledProgram);
router.post('/programs/:programId/enroll', authorize('student'), enrollInProgram);

// Alumni routes
router.post('/programs', authorize('alumni'), createMentorshipProgram);
router.get('/programs/alumni', authorize('alumni'), getAlumniPrograms);
router.put('/programs/:programId', authorize('alumni'), updateMentorshipProgram);
<<<<<<< HEAD
=======
router.delete('/programs/:programId', authorize('alumni', 'admin'), deleteMentorshipProgram);
>>>>>>> my-extra-files

// Common routes for alumni and students (program participants)
router.get('/programs/:programId', authorize('student', 'alumni', 'admin'), getProgramDetails);

<<<<<<< HEAD
// ✅ NEW: File upload support for content
router.post(
  '/programs/:programId/content',
  authorize('student', 'alumni'),
  upload.single('file'), // File field name: 'file'
=======
// ✅ Content routes with consistent file upload pattern
router.post(
  '/programs/:programId/content',
  authorize('student', 'alumni'),
  upload.single('file'),
>>>>>>> my-extra-files
  addProgramContent
);

router.get('/programs/:programId/content', authorize('student', 'alumni'), getProgramContent);
<<<<<<< HEAD
router.post('/programs/:programId/content', authorize('student', 'alumni'), addProgramContent);
router.get('/programs/:programId/content', authorize('student', 'alumni'), getProgramContent);

// ✅ NEW: Mentorship sessions
=======
router.get('/content/:contentId/download', authorize('student', 'alumni'), downloadContent);
router.delete('/content/:contentId', authorize('student', 'alumni'), deleteProgramContent);

// Mentorship sessions
>>>>>>> my-extra-files
router.post('/programs/:programId/sessions', authorize('alumni', 'student'), createSession);
router.get('/programs/:programId/sessions', authorize('alumni', 'student'), getSessions);
router.put('/sessions/:sessionId/status', authorize('alumni', 'student'), updateSessionStatus);

<<<<<<< HEAD

=======
>>>>>>> my-extra-files
// Admin routes
router.get('/admin/programs', authorize('admin'), getAdminMentorshipPrograms);

export default router;