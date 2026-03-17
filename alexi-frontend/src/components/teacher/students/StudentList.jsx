// import React, { useState } from 'react';
// import { Button, Card, Input, Modal, Avatar, FileUpload } from '../../../components/shared';
// import StudentEditModal from './StudentEditModal';
// import { Search, Plus, Edit2, Trash2, Eye, Mail, Phone, MessageSquare } from 'lucide-react';

// const StudentList = () => {
//   const [students, setStudents] = useState([
//     {
//       id: 1,
//       name: 'Aarav Sharma',
//       rollNo: '001',
//       age: 4,
//       parentName: 'Mr. Rajesh Sharma',
//       parentEmail: 'rajesh.sharma@email.com',
//       parentPhone: '9876543210',
//       avatar: null,
//       avgScore: 4.5,
//       attendance: 95,
//       totalStars: 245,
//       status: 'active'
//     },
//     {
//       id: 2,
//       name: 'Priya Patel',
//       rollNo: '002',
//       age: 4,
//       parentName: 'Mrs. Anjali Patel',
//       parentEmail: 'anjali.patel@email.com',
//       parentPhone: '9876543211',
//       avatar: null,
//       avgScore: 4.8,
//       attendance: 98,
//       totalStars: 289,
//       status: 'active'
//     },
//     {
//       id: 3,
//       name: 'Rohan Kumar',
//       rollNo: '003',
//       age: 5,
//       parentName: 'Mr. Vijay Kumar',
//       parentEmail: 'vijay.kumar@email.com',
//       parentPhone: '9876543212',
//       avatar: null,
//       avgScore: 4.2,
//       attendance: 92,
//       totalStars: 198,
//       status: 'active'
//     },
//   ]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [reviewText, setReviewText] = useState('');
//   const [formData, setFormData] = useState({
//     name: '',
//     rollNo: '',
//     age: '',
//     parentName: '',
//     parentEmail: '',
//     parentPhone: '',
//     avatar: null
//   });

//   const filteredStudents = students.filter(student =>
//     student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     student.rollNo.includes(searchQuery)
//   );

//   const handleAddStudent = () => {
//     const newStudent = {
//       id: students.length + 1,
//       name: formData.name,
//       rollNo: formData.rollNo,
//       age: parseInt(formData.age),
//       parentName: formData.parentName,
//       parentEmail: formData.parentEmail,
//       parentPhone: formData.parentPhone,
//       avatar: formData.avatar,
//       avgScore: 0,
//       attendance: 0,
//       totalStars: 0,
//       status: 'active'
//     };
//     setStudents([...students, newStudent]);
//     setShowAddModal(false);
//     setFormData({
//       name: '',
//       rollNo: '',
//       age: '',
//       parentName: '',
//       parentEmail: '',
//       parentPhone: '',
//       avatar: null
//     });
//   };

//   const handleViewStudent = (student) => {
//     setSelectedStudent(student);
//     setShowViewModal(true);
//   };

//   const handleDeleteStudent = (id) => {
//     if (window.confirm('Are you sure you want to remove this student?')) {
//       setStudents(students.filter(s => s.id !== id));
//     }
//   };

//   const handleEditStudent = (student) => {
//     setSelectedStudent(student);
//     setShowEditModal(true);
//   };

//   const handleSaveStudent = (updatedData) => {
//     setStudents(students.map(s => 
//       s.id === selectedStudent.id 
//         ? { ...s, ...updatedData }
//         : s
//     ));
//     setShowEditModal(false);
//     setSelectedStudent(null);
//   };

//   const handleAddReview = (student) => {
//     setSelectedStudent(student);
//     setReviewText('');
//     setShowReviewModal(true);
//   };

//   const submitReview = () => {
//     if (reviewText.trim()) {
//       console.log(`Review added for ${selectedStudent.name}: ${reviewText}`);
//       alert(`Review added for ${selectedStudent.name}`);
//       setShowReviewModal(false);
//       setReviewText('');
//       setSelectedStudent(null);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold text-text mb-2">Students</h1>
//           <p className="text-text/60">Manage your classroom students</p>
//         </div>
//         <Button
//           variant="primary"
//           icon={Plus}
//           onClick={() => setShowAddModal(true)}
//         >
//           Add Student
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-4 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <p className="text-sm text-blue-700 mb-1">Total Students</p>
//           <p className="text-3xl font-bold text-blue-900">{students.length}</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//           <p className="text-sm text-green-700 mb-1">Active</p>
//           <p className="text-3xl font-bold text-green-900">
//             {students.filter(s => s.status === 'active').length}
//           </p>
//         </Card>
//         <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//           <p className="text-sm text-yellow-700 mb-1">Avg Attendance</p>
//           <p className="text-3xl font-bold text-yellow-900">
//             {Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)}%
//           </p>
//         </Card>
//         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
//           <p className="text-sm text-purple-700 mb-1">Avg Score</p>
//           <p className="text-3xl font-bold text-purple-900">
//             {(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length).toFixed(1)}/5
//           </p>
//         </Card>
//       </div>

//       {/* Search */}
//       <Card>
//         <Input
//           placeholder="Search by name or roll number..."
//           icon={Search}
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </Card>

//       {/* Students Table */}
//       <Card>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-200">
//                 <th className="text-left py-4 px-4 font-semibold text-text">Student</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Roll No</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Age</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Parent</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Avg Score</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Attendance</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Stars</th>
//                 <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredStudents.map((student) => (
//                 <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                   <td className="py-4 px-4">
//                     <div className="flex items-center gap-3">
//                       <Avatar size="md" />
//                       <span className="font-semibold text-text">{student.name}</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4 text-text/70">{student.rollNo}</td>
//                   <td className="py-4 px-4 text-text/70">{student.age} yrs</td>
//                   <td className="py-4 px-4 text-text/70">{student.parentName}</td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center gap-1">
//                       <span className="font-semibold text-text">{student.avgScore}</span>
//                       <span className="text-text/50">/5</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <span className={`
//                       px-3 py-1 rounded-full text-sm font-semibold
//                       ${student.attendance >= 95 ? 'bg-green-100 text-green-700' :
//                         student.attendance >= 85 ? 'bg-yellow-100 text-yellow-700' :
//                         'bg-red-100 text-red-700'}
//                     `}>
//                       {student.attendance}%
//                     </span>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center gap-1">
//                       <span className="text-xl">⭐</span>
//                       <span className="font-semibold text-text">{student.totalStars}</span>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center justify-end gap-2">
//                       <button
//                         onClick={() => handleViewStudent(student)}
//                         className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
//                         title="View Details"
//                       >
//                         <Eye size={18} className="text-blue-600" />
//                       </button>
//                       <button
//                         onClick={() => handleAddReview(student)}
//                         className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
//                         title="Add Review"
//                       >
//                         <MessageSquare size={18} className="text-purple-600" />
//                       </button>
//                       <button
//                         onClick={() => handleEditStudent(student)}
//                         className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
//                         title="Edit"
//                       >
//                         <Edit2 size={18} className="text-yellow-600" />
//                       </button>
//                       <button
//                         onClick={() => handleDeleteStudent(student.id)}
//                         className="p-2 hover:bg-red-50 rounded-lg transition-colors"
//                         title="Delete"
//                       >
//                         <Trash2 size={18} className="text-red-600" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card>

//       {/* Add Student Modal */}
//       <Modal
//         isOpen={showAddModal}
//         onClose={() => setShowAddModal(false)}
//         title="Add New Student"
//         size="md"
//       >
//         <div className="space-y-4">
//           <Input
//             label="Student Name"
//             placeholder="Enter full name"
//             value={formData.name}
//             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//           />
//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="Roll Number"
//               placeholder="e.g., 001"
//               value={formData.rollNo}
//               onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
//             />
//             <Input
//               label="Age"
//               type="number"
//               placeholder="Age"
//               value={formData.age}
//               onChange={(e) => setFormData({ ...formData, age: e.target.value })}
//             />
//           </div>
//           <Input
//             label="Parent Name"
//             placeholder="Enter parent name"
//             value={formData.parentName}
//             onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
//           />
//           <Input
//             label="Parent Email"
//             type="email"
//             icon={Mail}
//             placeholder="parent@email.com"
//             value={formData.parentEmail}
//             onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
//           />
//           <Input
//             label="Parent Phone"
//             type="tel"
//             icon={Phone}
//             placeholder="Phone number"
//             value={formData.parentPhone}
//             onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
//           />
//           <div>
//             <label className="block text-sm font-semibold text-text mb-3">Student Photo</label>
//             <FileUpload
//               accept="image/*"
//               label="Upload Student Photo"
//               onFileSelect={(file) => setFormData({ ...formData, avatar: file })}
//             />
//           </div>
//           <div className="flex gap-3 mt-6">
//             <Button variant="primary" onClick={handleAddStudent} className="flex-1">
//               Add Student
//             </Button>
//             <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* View Student Modal */}
//       {selectedStudent && (
//         <Modal
//           isOpen={showViewModal}
//           onClose={() => setShowViewModal(false)}
//           title="Student Details"
//           size="lg"
//         >
//           <div className="space-y-6">
//             <div className="flex items-center gap-4">
//               <Avatar size="xl" />
//               <div>
//                 <h3 className="text-2xl font-bold text-text">{selectedStudent.name}</h3>
//                 <p className="text-text/60">Roll No: {selectedStudent.rollNo}</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-4">
//               <Card padding="sm" className="text-center">
//                 <p className="text-sm text-text/60 mb-1">Avg Score</p>
//                 <p className="text-3xl font-bold text-primary-600">{selectedStudent.avgScore}/5</p>
//               </Card>
//               <Card padding="sm" className="text-center">
//                 <p className="text-sm text-text/60 mb-1">Attendance</p>
//                 <p className="text-3xl font-bold text-green-600">{selectedStudent.attendance}%</p>
//               </Card>
//               <Card padding="sm" className="text-center">
//                 <p className="text-sm text-text/60 mb-1">Total Stars</p>
//                 <p className="text-3xl font-bold text-yellow-600">{selectedStudent.totalStars}</p>
//               </Card>
//             </div>

//             <div>
//               <h4 className="font-semibold text-text mb-3">Parent Information</h4>
//               <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
//                 <p className="text-text"><strong>Name:</strong> {selectedStudent.parentName}</p>
//                 <p className="text-text"><strong>Email:</strong> {selectedStudent.parentEmail}</p>
//                 <p className="text-text"><strong>Phone:</strong> {selectedStudent.parentPhone}</p>
//               </div>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Edit Student Modal */}
//       <StudentEditModal
//         isOpen={showEditModal}
//         onClose={() => {
//           setShowEditModal(false);
//           setSelectedStudent(null);
//         }}
//         student={selectedStudent}
//         onSave={handleSaveStudent}
//       />

//       {/* Add Review Modal */}
//       <Modal
//         isOpen={showReviewModal}
//         onClose={() => setShowReviewModal(false)}
//         title={`Add Review for ${selectedStudent?.name}`}
//         size="md"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-semibold text-text mb-2">Review Notes</label>
//             <textarea
//               value={reviewText}
//               onChange={(e) => setReviewText(e.target.value)}
//               placeholder="Write your review or notes for this student..."
//               className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 resize-none"
//               rows="4"
//             />
//           </div>
//           <div className="flex gap-3">
//             <Button
//               variant="primary"
//               onClick={submitReview}
//               className="flex-1"
//             >
//               Submit Review
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => setShowReviewModal(false)}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default StudentList;








// src/components/teacher/students/StudentList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Stars shown ONLY for Aarav Sharma (student-1) in stats card — live from StarContext
// No live stars column in the main table
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Input, Modal, Avatar, FileUpload } from '../../../components/shared';
import StudentEditModal from './StudentEditModal';
import { Search, Plus, Edit2, Trash2, Eye, Mail, Phone, MessageSquare, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStars } from '../../../context/StarContext';
import { API_BASE_URL } from '../../../config';

const StudentList = () => {
  // ── Star store — only used for Aarav Sharma (student-1) ────────────────────
  const { getTotalStars, getTodayStars, getTodayActivities, getStudentResults } = useStars();

  // ── Student data (in production this would come from your backend/auth) ───
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/all-students-with-stats`);

      // Backend data ko frontend format mein convert karo
      const formatted = res.data.map((s, index) => ({
        id: index + 1,
        studentId: s._id,              // ✅ Real MongoDB ObjectId
        mongoId: s._id,
        name: s.name || '',
        rollNo: s.roll_number || `00${index + 1}`,
        age: s.age || 4,
        parentName: s.parent_name || '',
        parentEmail: s.email || '',
        parentPhone: s.phone || '',
        avatar: null,
        avgScore: s.avg_score || 0,
        attendance: s.attendance || 0,
        status: 'active',
      }));

      setStudents(formatted);
      setError(null);
    } catch (err) {
      console.error('Students fetch error:', err);
      setError('Could not load students. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [formData, setFormData] = useState({ name: '', rollNo: '', age: '', parentName: '', parentEmail: '', parentPhone: '', avatar: null });

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery)
  );

  const handleAddStudent = async () => {
    try {
      // Backend mein save karo
      await axios.post(`${API_BASE_URL}/api/admin/add-student`, {
        name: formData.name,
        rollNumber: formData.rollNo,
        age: formData.age,
        parentName: formData.parentName,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      });

      // DB se fresh data lo
      await fetchStudents();

      setShowAddModal(false);
      setFormData({ name: '', rollNo: '', age: '', parentName: '', parentEmail: '', parentPhone: '', avatar: null });
    } catch (err) {
      console.error('Add student error:', err);
      alert('Could not add student. Please try again.');
    }
  };

  const handleViewStudent = (s) => { setSelectedStudent(s); setShowViewModal(true); };
  const handleEditStudent = (s) => { setSelectedStudent(s); setShowEditModal(true); };
  const handleAddReview = (s) => { setSelectedStudent(s); setReviewText(''); setShowReviewModal(true); };
  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student?'))
      setStudents(students.filter(s => s.id !== id));
  };
  const handleSaveStudent = (updatedData) => {
    setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, ...updatedData } : s));
    setShowEditModal(false);
    setSelectedStudent(null);
  };
  const submitReview = () => {
    if (reviewText.trim()) {
      alert(`Review added for ${selectedStudent.name}`);
      setShowReviewModal(false);
      setReviewText('');
      setSelectedStudent(null);
    }
  };

  // Stars for Aarav Sharma only (student-1)
  const firstStudent = students[0];
  const aaravStars = firstStudent ? getTotalStars(firstStudent.studentId) : 0;
  const aaravTodayStars = firstStudent ? getTodayStars(firstStudent.studentId) : 0;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
            <p className="text-text/60 font-medium">Loading students from database...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-bold text-red-700">Database Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchStudents}
            className="ml-auto px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text mb-2">Students</h1>
          <p className="text-text/60">Manage your classroom students</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-blue-900">{students.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-700 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-900">{students.filter(s => s.status === 'active').length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Avg Attendance</p>
          <p className="text-3xl font-bold text-yellow-900">
            {Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length)}%
          </p>
        </Card>
        {/* ★ AARAV SHARMA STARS ONLY */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="fill-orange-500 text-orange-500" />
            <p className="text-sm text-orange-700 font-semibold">Total Stars (All)</p>
          </div>
          <p className="text-3xl font-bold text-orange-900">
            {students.reduce((sum, s) => sum + getTotalStars(s.studentId), 0)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            {students.reduce((sum, s) => sum + getTodayStars(s.studentId), 0) > 0
              ? `+${students.reduce((sum, s) => sum + getTodayStars(s.studentId), 0)} today ⚡`
              : 'All students combined ⭐'}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search by name or roll number..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-text">Student</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Roll No</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Age</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Parent</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Avg Score</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Attendance</th>
                {/* ★ LIVE STARS COLUMN — shows per student */}
                <th className="text-left py-4 px-4 font-semibold text-text">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    Stars
                  </div>
                </th>
                <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const liveStars = getTotalStars(student.studentId);
                const todayStars = getTodayStars(student.studentId);
                return (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="md" />
                        <span className="font-semibold text-text">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text/70">{student.rollNo}</td>
                    <td className="py-4 px-4 text-text/70">{student.age} yrs</td>
                    <td className="py-4 px-4 text-text/70">{student.parentName}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-text">{student.avgScore}</span>
                        <span className="text-text/50">/5</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${student.attendance >= 95 ? 'bg-green-100 text-green-700' :
                        student.attendance >= 85 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {student.attendance}%
                      </span>
                    </td>

                    {/* ★ LIVE STARS CELL — updates instantly when activity completes */}
                    <td className="py-4 px-4">
                      <motion.div
                        key={liveStars}
                        initial={{ scale: 1.4, backgroundColor: '#fef08a' }}
                        animate={{ scale: 1, backgroundColor: '#ffffff00' }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-1 rounded-xl px-1"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-lg">⭐</span>
                          <span className="font-bold text-text text-lg">{liveStars}</span>
                        </div>
                        {todayStars > 0 && (
                          <div className="text-xs text-green-600 font-semibold bg-green-50 rounded-full px-2 py-0.5 w-fit">
                            +{todayStars} today
                          </div>
                        )}
                      </motion.div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewStudent(student)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye size={18} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleAddReview(student)} className="p-2 hover:bg-purple-50 rounded-lg transition-colors" title="Add Review">
                          <MessageSquare size={18} className="text-purple-600" />
                        </button>
                        <button onClick={() => handleEditStudent(student)} className="p-2 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={18} className="text-yellow-600" />
                        </button>
                        <button onClick={() => handleDeleteStudent(student.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Add Student Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student" size="md">
        <div className="space-y-4">
          <Input label="Student Name" placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Roll Number" placeholder="e.g., 004" value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} />
            <Input label="Age" type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
          </div>
          <Input label="Parent Name" placeholder="Enter parent name" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
          <Input label="Parent Email" type="email" icon={Mail} placeholder="parent@email.com" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} />
          <Input label="Parent Phone" type="tel" icon={Phone} placeholder="Phone number" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold text-text mb-3">Student Photo</label>
            <FileUpload accept="image/*" label="Upload Student Photo" onFileSelect={(file) => setFormData({ ...formData, avatar: file })} />
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={handleAddStudent} className="flex-1">Add Student</Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ── View Student Modal (with LIVE stars + activity history) ──────── */}
      {selectedStudent && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Student Details" size="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar size="xl" />
              <div>
                <h3 className="text-2xl font-bold text-text">{selectedStudent.name}</h3>
                <p className="text-text/60">Roll No: {selectedStudent.rollNo}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-sm text-text/60 mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-primary-600">{selectedStudent.avgScore}/5</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-sm text-text/60 mb-1">Attendance</p>
                <p className="text-3xl font-bold text-green-600">{selectedStudent.attendance}%</p>
              </Card>
              {/* ★ LIVE STARS */}
              <Card padding="sm" className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  <p className="text-sm text-yellow-700 font-semibold">Total Stars</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">
                  {getTotalStars(selectedStudent.studentId)}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  +{getTodayStars(selectedStudent.studentId)} today
                </p>
              </Card>
            </div>

            {/* Activity history */}
            {(() => {
              const history = getStudentResults(selectedStudent.studentId);
              return history.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-text mb-3">Recent Activity History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.slice(0, 10).map((r) => (
                      <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-text text-sm">{r.activityName}</p>
                          <p className="text-xs text-text/50">
                            {new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {[...Array(5)].map((_, i) => <span key={i}>{i < r.stars ? '⭐' : '☆'}</span>)}
                          </p>
                          <p className="text-xs text-text/50">{r.score}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-text/40">
                  <p>No activities completed yet.</p>
                  <p className="text-sm">Launch an activity from the Activities tab!</p>
                </div>
              );
            })()}

            {/* Parent info */}
            <div>
              <h4 className="font-semibold text-text mb-3">Parent Information</h4>
              <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
                <p className="text-text"><strong>Name:</strong> {selectedStudent.parentName}</p>
                <p className="text-text"><strong>Email:</strong> {selectedStudent.parentEmail}</p>
                <p className="text-text"><strong>Phone:</strong> {selectedStudent.parentPhone}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <StudentEditModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedStudent(null); }}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />

      {/* ── Review Modal ───────────────────────────────────────────────────── */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title={`Add Review for ${selectedStudent?.name}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Review Notes</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review or notes for this student..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 resize-none"
              rows="4"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={submitReview} className="flex-1">Submit Review</Button>
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default StudentList;