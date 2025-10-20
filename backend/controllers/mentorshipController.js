import MentorshipProgram from '../models/Mentorship.js';
import MentorshipSession from '../models/MentorshipSession.js';
import MentorshipContent from '../models/MentorshipContent.js';
<<<<<<< HEAD
import fs from 'fs';


=======
import multer from 'multer';
import path from 'path';
import fs from 'fs';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/mentorship';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `content-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'application/zip',
    'application/x-rar-compressed'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, TXT, Images, Videos, ZIP, RAR'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for mentorship content
  }
});




>>>>>>> my-extra-files
// @desc    Create mentorship program (Alumni)
// @route   POST /api/mentorship/programs
// @access  Private (Alumni)
export const createMentorshipProgram = async (req, res) => {
  try {
    const {
      title,
      description,
      topics,
      duration,
      cost,
      maxStudents,
      requirements,
      learningOutcomes,
      schedule
    } = req.body;

    
    // ✅ NEW: Stronger validation
    if (!title || !description || !duration?.value) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and duration value are required.'
      });
    }

    // Check if user is alumni
    if (req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can create mentorship programs'
      });
    }

    const program = await MentorshipProgram.create({
      title,
      description,
      topics: Array.isArray(topics) ? topics : [topics],
      alumniId: req.user.id,
      duration,
      cost: cost || 0,
      maxStudents: maxStudents || 1,
      requirements: requirements || [],
      learningOutcomes: learningOutcomes || [],
      schedule: schedule || {}
    });

    const populatedProgram = await MentorshipProgram.findById(program._id)
      .populate('alumniId', 'firstName lastName profile');

    res.status(201).json({
      success: true,
      message: 'Mentorship program created successfully',
      program: populatedProgram
    });
  } catch (error) {
    console.error('Create mentorship program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get alumni's mentorship programs
// @route   GET /api/mentorship/programs/alumni
// @access  Private (Alumni)
export const getAlumniPrograms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { alumniId: req.user.id };
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const programs = await MentorshipProgram.find(filter)
      .populate('enrolledStudents.studentId', 'firstName lastName email profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipProgram.countDocuments(filter);

    // Calculate program statistics
    const programsWithStats = programs.map(program => {
      const activeEnrollments = program.enrolledStudents.filter(
        enrollment => enrollment.status === 'active'
      ).length;
      
      return {
        ...program.toObject(),
        activeEnrollments,
        isFull: activeEnrollments >= program.maxStudents
      };
    });

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      programs: programsWithStats
    });
  } catch (error) {
    console.error('Get alumni programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all mentorship programs for students (with search/filter)
// @route   GET /api/mentorship/programs
// @access  Private (Student)
export const getAllPrograms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      topic,
      maxCost,
      duration,
      sort = '-createdAt'
    } = req.query;

    const filter = { isActive: true };
    
    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by topic
    if (topic) {
      filter.topics = { $in: [new RegExp(topic, 'i')] };
    }

    // Filter by maximum cost
    if (maxCost) {
      filter.cost = { $lte: parseFloat(maxCost) };
    }

    // Filter by duration
    if (duration) {
      filter['duration.value'] = { $lte: parseInt(duration) };
    }

    const programs = await MentorshipProgram.find(filter)
      .populate('alumniId', 'firstName lastName profile')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipProgram.countDocuments(filter);

    // Add enrollment status for current student
    const programsWithEnrollmentStatus = programs.map(program => {
      const programObj = program.toObject();
      const isEnrolled = program.enrolledStudents.some(
        enrollment => enrollment.studentId.toString() === req.user.id && enrollment.status === 'active'
      );
      const activeEnrollments = program.enrolledStudents.filter(
        enrollment => enrollment.status === 'active'
      ).length;

      return {
        ...programObj,
        isEnrolled,
        activeEnrollments,
        availableSlots: program.maxStudents - activeEnrollments
      };
    });

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      programs: programsWithEnrollmentStatus
    });
  } catch (error) {
    console.error('Get all programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Enroll in mentorship program (Student)
// @route   POST /api/mentorship/programs/:programId/enroll
// @access  Private (Student)
export const enrollInProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can enroll in mentorship programs'
      });
    }

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if program is active
    if (!program.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This mentorship program is not active'
      });
    }

    // Check if student is already enrolled
    if (program.isStudentEnrolled(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this program'
      });
    }

    // Check if student is already enrolled in any active program
    const activeEnrollment = await MentorshipProgram.findOne({
      'enrolledStudents.studentId': req.user.id,
      'enrolledStudents.status': 'active'
    });

    if (activeEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You can only be enrolled in one mentorship program at a time'
      });
    }

    // Check if program has available slots
    if (program.isFull) {
      return res.status(400).json({
        success: false,
        message: 'This program is currently full'
      });
    }

    // Add student to enrolled students
    program.enrolledStudents.push({
      studentId: req.user.id,
      status: 'active'
    });

    await program.save();

    const updatedProgram = await MentorshipProgram.findById(programId)
      .populate('alumniId', 'firstName lastName email profile')
      .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in mentorship program',
      program: updatedProgram
    });
  } catch (error) {
    console.error('Enroll in program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get program details
// @route   GET /api/mentorship/programs/:programId
// @access  Private (Student, Alumni, Admin)
export const getProgramDetails = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await MentorshipProgram.findById(programId)
      .populate('alumniId', 'firstName lastName email profile')
      .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check access permissions
    const isAlumniOwner = program.alumniId._id.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAlumniOwner && !isStudentEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to program details'
      });
    }

    res.status(200).json({
      success: true,
      program
    });
  } catch (error) {
    console.error('Get program details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

<<<<<<< HEAD
// @desc    Add content to mentorship program
=======
// @desc    Add content to mentorship program (Consistent with CV upload pattern)
>>>>>>> my-extra-files
// @route   POST /api/mentorship/programs/:programId/content
// @access  Private (Alumni, Student - for their programs)
export const addProgramContent = async (req, res) => {
  try {
    const { programId } = req.params;
<<<<<<< HEAD
    const { title, description, type, content, isPublic, accessLevel } = req.body;

     // ✅ NEW: Validation for required fields
=======
    const { title, description, type, isPublic = 'true', accessLevel = 'all' } = req.body;

    // ✅ Validation (consistent with CV controller)
>>>>>>> my-extra-files
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and content type are required'
      });
    }

<<<<<<< HEAD
    // ✅ NEW: Check valid content type
=======
    // ✅ Check valid content type
>>>>>>> my-extra-files
    const validTypes = ['file', 'link', 'text', 'assignment'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid content type. Allowed: ${validTypes.join(', ')}`
      });
    }

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if user has access to add content
    const isAlumniOwner = program.alumniId.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);

    if (!isAlumniOwner && !isStudentEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to add content'
      });
    }

<<<<<<< HEAD
     let contentData = content || {};

    // ✅ NEW: Handle uploaded file
    if (req.file && type === 'file') {
      contentData = {
        fileUrl: `/uploads/mentorship/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size
      };
    }

    const mentorshipContent = await MentorshipContent.create({
      programId,
      title,
      description,
      type,
      content,
      isPublic: isPublic !== undefined ? isPublic : true,
      accessLevel: accessLevel || 'all',
      postedBy: req.user.id
    });

    const populatedContent = await MentorshipContent.findById(mentorshipContent._id)
      .populate('postedBy', 'firstName lastName role');
=======
    // ✅ Handle content data (consistent pattern with CV)
    let contentData = {};

    if (type === 'file') {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required for file content type'
        });
      }
      
      contentData = {
        fileUrl: `/uploads/mentorship/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };
    } 
    else if (type === 'link') {
      const { linkUrl } = req.body;
      if (!linkUrl) {
        return res.status(400).json({
          success: false,
          message: 'Link URL is required for link content type'
        });
      }
      contentData = { linkUrl };
    } 
    else if (type === 'text') {
      const { textContent } = req.body;
      if (!textContent) {
        return res.status(400).json({
          success: false,
          message: 'Text content is required for text type'
        });
      }
      contentData = { textContent };
    }
    else if (type === 'assignment') {
      const { assignmentDescription, dueDate } = req.body;
      contentData = {
        assignmentDescription: assignmentDescription || '',
        dueDate: dueDate || null
      };
    }

    // ✅ Create content (consistent with CV creation)
    const mentorshipContent = await MentorshipContent.create({
      programId,
      title,
      description: description || '',
      type,
      content: contentData,
      isPublic: isPublic === 'true',
      accessLevel,
      postedBy: req.user.id
    });

    // ✅ Populate response (consistent with CV controller)
    const populatedContent = await MentorshipContent.findById(mentorshipContent._id)
      .populate('postedBy', 'firstName lastName role profile');
>>>>>>> my-extra-files

    res.status(201).json({
      success: true,
      message: 'Content added successfully',
      content: populatedContent
    });
  } catch (error) {
    console.error('Add program content error:', error);
    res.status(500).json({
      success: false,
<<<<<<< HEAD
      message: 'Server error',
=======
      message: 'Server error during content upload',
>>>>>>> my-extra-files
      error: error.message
    });
  }
};

<<<<<<< HEAD
// @desc    Get program content
=======
// @desc    Get program content (Consistent with CV pattern)
>>>>>>> my-extra-files
// @route   GET /api/mentorship/programs/:programId/content
// @access  Private (Alumni, Student - for their programs)
export const getProgramContent = async (req, res) => {
  try {
    const { programId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if user has access to view content
    const isAlumniOwner = program.alumniId.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);

    if (!isAlumniOwner && !isStudentEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to view content'
      });
    }

    const filter = { programId };
    if (type) {
      filter.type = type;
    }

    const content = await MentorshipContent.find(filter)
<<<<<<< HEAD
      .populate('postedBy', 'firstName lastName role')
=======
      .populate('postedBy', 'firstName lastName role profile')
>>>>>>> my-extra-files
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipContent.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: content.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      content
    });
  } catch (error) {
    console.error('Get program content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

<<<<<<< HEAD
=======
// @desc    Download content file (Consistent with CV download)
// @route   GET /api/mentorship/content/:contentId/download
// @access  Private (Alumni, Student - for their programs)
export const downloadContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await MentorshipContent.findById(contentId)
      .populate('postedBy', 'firstName lastName')
      .populate({
        path: 'programId',
        select: 'alumniId',
        populate: {
          path: 'alumniId',
          select: 'firstName lastName'
        }
      });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (content.type !== 'file') {
      return res.status(400).json({
        success: false,
        message: 'Only file content can be downloaded'
      });
    }

    // Check access permissions
    const program = content.programId;
    const isAlumniOwner = program.alumniId._id.toString() === req.user.id;
    const isStudentEnrolled = program.isStudentEnrolled(req.user.id);

    if (!isAlumniOwner && !isStudentEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to download content'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'mentorship', path.basename(content.content.fileUrl));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${content.content.fileName}"`);
    res.setHeader('Content-Type', content.content.mimeType || 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete program content (Consistent with CV delete)
// @route   DELETE /api/mentorship/content/:contentId
// @access  Private (Content owner or program alumni)
export const deleteProgramContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await MentorshipContent.findById(contentId)
      .populate({
        path: 'programId',
        select: 'alumniId'
      });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user can delete content (content owner or program alumni)
    const isContentOwner = content.postedBy.toString() === req.user.id;
    const isProgramAlumni = content.programId.alumniId.toString() === req.user.id;

    if (!isContentOwner && !isProgramAlumni) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete content'
      });
    }

    // Delete file from filesystem if it's a file type
    if (content.type === 'file' && content.content.fileUrl) {
      const filePath = path.join(process.cwd(), 'uploads', 'mentorship', path.basename(content.content.fileUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await content.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete program content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

>>>>>>> my-extra-files
// @desc    Update mentorship program
// @route   PUT /api/mentorship/programs/:programId
// @access  Private (Alumni - owner only)
export const updateMentorshipProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if user is the alumni owner
    if (program.alumniId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only program owner can update.'
      });
    }

    const updatedProgram = await MentorshipProgram.findByIdAndUpdate(
      programId,
      req.body,
      { new: true, runValidators: true }
    ).populate('alumniId', 'firstName lastName profile')
     .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    res.status(200).json({
      success: true,
      message: 'Program updated successfully',
      program: updatedProgram
    });
  } catch (error) {
    console.error('Update mentorship program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get admin mentorship programs
// @route   GET /api/mentorship/admin/programs
// @access  Private (Admin)
export const getAdminMentorshipPrograms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {};
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const programs = await MentorshipProgram.find(filter)
      .populate('alumniId', 'firstName lastName email profile')
      .populate('enrolledStudents.studentId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MentorshipProgram.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      programs
    });
  } catch (error) {
    console.error('Get admin mentorship programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's enrolled program
// @route   GET /api/mentorship/student/my-program
// @access  Private (Student)
export const getStudentEnrolledProgram = async (req, res) => {
  try {
    const program = await MentorshipProgram.findOne({
      'enrolledStudents.studentId': req.user.id,
      'enrolledStudents.status': 'active'
    })
    .populate('alumniId', 'firstName lastName email profile')
    .populate('enrolledStudents.studentId', 'firstName lastName email profile');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'No active mentorship program found'
      });
    }

    res.status(200).json({
      success: true,
      program
    });
  } catch (error) {
    console.error('Get student enrolled program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
<<<<<<< HEAD
=======
};

// @desc    Delete mentorship program
// @route   DELETE /api/mentorship/programs/:programId
// @access  Private (Alumni - owner only, Admin)
export const deleteMentorshipProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await MentorshipProgram.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship program not found'
      });
    }

    // Check if user has permission to delete
    const isAlumniOwner = program.alumniId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAlumniOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only program owner or admin can delete.'
      });
    }

    // Check if there are active enrollments (optional: you might want to prevent deletion if there are active students)
    const activeEnrollments = program.enrolledStudents.filter(
      enrollment => enrollment.status === 'active'
    ).length;

    if (activeEnrollments > 0 && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete program with active enrollments. Please deactivate instead.'
      });
    }

    // Delete associated content and sessions first
    await MentorshipContent.deleteMany({ programId });
    await MentorshipSession.deleteMany({ programId });

    // Delete the program
    await MentorshipProgram.findByIdAndDelete(programId);

    res.status(200).json({
      success: true,
      message: 'Mentorship program deleted successfully'
    });
  } catch (error) {
    console.error('Delete mentorship program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
>>>>>>> my-extra-files
};