// import React, { useState } from 'react';
// import { Card, Button, Input, Modal, Avatar } from '../../../components/shared';
// import { Search, Plus, CheckCircle, XCircle, Eye, Mail, Phone, Building2, User } from 'lucide-react';
// import { motion } from 'framer-motion';

// const TeacherManagement = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showApprovalModal, setShowApprovalModal] = useState(false);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);

//   const [teachers, setTeachers] = useState([
//     {
//       id: 1,
//       name: 'Mrs. Priya Singh',
//       email: 'priya.singh@school.com',
//       phone: '9876543210',
//       school: 'Sunshine International School',
//       class: 'Junior KG-A',
//       students: 18,
//       status: 'active',
//       joinedDate: '2025-01-15',
//       lastActive: '2 hours ago'
//     },
//     {
//       id: 2,
//       name: 'Mr. Rajesh Kumar',
//       email: 'rajesh.kumar@school.com',
//       phone: '9876543211',
//       school: 'Sunshine International School',
//       class: 'Junior KG-B',
//       students: 16,
//       status: 'active',
//       joinedDate: '2025-01-20',
//       lastActive: '5 hours ago'
//     },
//     {
//       id: 3,
//       name: 'Ms. Anjali Mehta',
//       email: 'anjali.mehta@school.com',
//       phone: '9876543212',
//       school: 'Bright Future School',
//       class: 'Junior KG-C',
//       students: 15,
//       status: 'active',
//       joinedDate: '2025-02-01',
//       lastActive: '1 day ago'
//     },
//     {
//       id: 4,
//       name: 'Mr. Rahul Verma',
//       email: 'rahul.verma@school.com',
//       phone: '9876543213',
//       school: 'Little Stars Academy',
//       class: 'Junior KG-A',
//       students: 0,
//       status: 'pending',
//       joinedDate: '2026-02-15',
//       lastActive: 'Never'
//     },
//   ]);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     school: '',
//     class: ''
//   });

//   const filteredTeachers = teachers.filter(teacher => {
//     const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const handleApprove = (teacher) => {
//     setTeachers(teachers.map(t => 
//       t.id === teacher.id ? { ...t, status: 'active' } : t
//     ));
//     setShowApprovalModal(false);
//     alert(`${teacher.name} has been approved!`);
//   };

//   const handleReject = (teacher) => {
//     if (window.confirm(`Are you sure you want to reject ${teacher.name}?`)) {
//       setTeachers(teachers.filter(t => t.id !== teacher.id));
//       setShowApprovalModal(false);
//     }
//   };

//   const handleDeactivate = (teacher) => {
//     if (window.confirm(`Are you sure you want to deactivate ${teacher.name}?`)) {
//       setTeachers(teachers.map(t => 
//         t.id === teacher.id ? { ...t, status: 'inactive' } : t
//       ));
//     }
//   };

//   const handleAddTeacher = () => {
//     const newTeacher = {
//       id: teachers.length + 1,
//       ...formData,
//       students: 0,
//       status: 'active',
//       joinedDate: new Date().toISOString().split('T')[0],
//       lastActive: 'Just now'
//     };
//     setTeachers([...teachers, newTeacher]);
//     setShowAddModal(false);
//     setFormData({ name: '', email: '', phone: '', school: '', class: '' });
//     alert('Teacher added successfully!');
//   };

//   const stats = {
//     total: teachers.length,
//     active: teachers.filter(t => t.status === 'active').length,
//     pending: teachers.filter(t => t.status === 'pending').length,
//     inactive: teachers.filter(t => t.status === 'inactive').length,
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold text-text mb-2">Teacher Management</h1>
//           <p className="text-text/60">Manage teacher accounts and approvals</p>
//         </div>
//         <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
//           Add Teacher
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-4 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <p className="text-sm text-blue-700 mb-1">Total Teachers</p>
//           <p className="text-4xl font-bold text-blue-900">{stats.total}</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//           <p className="text-sm text-green-700 mb-1">Active</p>
//           <p className="text-4xl font-bold text-green-900">{stats.active}</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//           <p className="text-sm text-yellow-700 mb-1">Pending Approval</p>
//           <p className="text-4xl font-bold text-yellow-900">{stats.pending}</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
//           <p className="text-sm text-gray-700 mb-1">Inactive</p>
//           <p className="text-4xl font-bold text-gray-900">{stats.inactive}</p>
//         </Card>
//       </div>

//       {/* Search and Filter */}
//       <Card>
//         <div className="grid grid-cols-2 gap-4">
//           <Input
//             placeholder="Search by name or email..."
//             icon={Search}
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="pending">Pending</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>
//       </Card>

//       {/* Teachers Table */}
//       <Card>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-200">
//                 <th className="text-left py-4 px-4 font-semibold text-text">Teacher</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Contact</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">School</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Class</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Students</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Status</th>
//                 <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredTeachers.map((teacher, index) => (
//                 <tr
//                   key={teacher.id}
//                   className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="py-4 px-4">
//                     <div className="flex items-center gap-3">
//                       <Avatar size="md" />
//                       <div>
//                         <p className="font-semibold text-text">{teacher.name}</p>
//                         <p className="text-sm text-text/60">Joined: {teacher.joinedDate}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="space-y-1">
//                       <p className="text-sm text-text flex items-center gap-1">
//                         <Mail size={14} className="text-text/60" />
//                         {teacher.email}
//                       </p>
//                       <p className="text-sm text-text flex items-center gap-1">
//                         <Phone size={14} className="text-text/60" />
//                         {teacher.phone}
//                       </p>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <p className="text-sm text-text flex items-center gap-1">
//                       <Building2 size={14} className="text-text/60" />
//                       {teacher.school}
//                     </p>
//                   </td>
//                   <td className="py-4 px-4 text-text/70">{teacher.class}</td>
//                   <td className="py-4 px-4">
//                     <span className="font-semibold text-text">{teacher.students}</span>
//                   </td>
//                   <td className="py-4 px-4">
//                     <span className={`
//                       px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1
//                       ${teacher.status === 'active' ? 'bg-green-100 text-green-700' :
//                         teacher.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
//                         'bg-gray-100 text-gray-700'}
//                     `}>
//                       {teacher.status === 'active' && <CheckCircle size={14} />}
//                       {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center justify-end gap-2">
//                       <button
//                         onClick={() => {
//                           setSelectedTeacher(teacher);
//                           setShowApprovalModal(true);
//                         }}
//                         className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
//                         title="View Details"
//                       >
//                         <Eye size={18} className="text-blue-600" />
//                       </button>
//                       {teacher.status === 'pending' && (
//                         <>
//                           <button
//                             onClick={() => handleApprove(teacher)}
//                             className="p-2 hover:bg-green-50 rounded-lg transition-colors"
//                             title="Approve"
//                           >
//                             <CheckCircle size={18} className="text-green-600" />
//                           </button>
//                           <button
//                             onClick={() => handleReject(teacher)}
//                             className="p-2 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Reject"
//                           >
//                             <XCircle size={18} className="text-red-600" />
//                           </button>
//                         </>
//                       )}
//                       {teacher.status === 'active' && (
//                         <button
//                           onClick={() => handleDeactivate(teacher)}
//                           className="p-2 hover:bg-red-50 rounded-lg transition-colors"
//                           title="Deactivate"
//                         >
//                           <XCircle size={18} className="text-red-600" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card>

//       {/* Add Teacher Modal */}
//       <Modal
//         isOpen={showAddModal}
//         onClose={() => setShowAddModal(false)}
//         title="Add New Teacher"
//         size="md"
//       >
//         <div className="space-y-4">
//           <Input
//             label="Full Name"
//             icon={User}
//             placeholder="Enter full name"
//             value={formData.name}
//             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//           />
//           <Input
//             label="Email Address"
//             icon={Mail}
//             type="email"
//             placeholder="Enter email"
//             value={formData.email}
//             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//           />
//           <Input
//             label="Phone Number"
//             icon={Phone}
//             type="tel"
//             placeholder="Enter phone"
//             value={formData.phone}
//             onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//           />
//           <Input
//             label="School Name"
//             icon={Building2}
//             placeholder="Enter school name"
//             value={formData.school}
//             onChange={(e) => setFormData({ ...formData, school: e.target.value })}
//           />
//           <Input
//             label="Class"
//             placeholder="e.g., Junior KG-A"
//             value={formData.class}
//             onChange={(e) => setFormData({ ...formData, class: e.target.value })}
//           />
//           <div className="flex gap-3 mt-6">
//             <Button variant="primary" onClick={handleAddTeacher} className="flex-1">
//               Add Teacher
//             </Button>
//             <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* View/Approval Modal */}
//       {selectedTeacher && (
//         <Modal
//           isOpen={showApprovalModal}
//           onClose={() => setShowApprovalModal(false)}
//           title="Teacher Details"
//           size="md"
//         >
//           <div className="space-y-4">
//             <div className="flex items-center gap-4 pb-4 border-b">
//               <Avatar size="xl" />
//               <div>
//                 <h3 className="text-2xl font-bold text-text">{selectedTeacher.name}</h3>
//                 <span className={`
//                   inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1
//                   ${selectedTeacher.status === 'active' ? 'bg-green-100 text-green-700' :
//                     selectedTeacher.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
//                     'bg-gray-100 text-gray-700'}
//                 `}>
//                   {selectedTeacher.status.charAt(0).toUpperCase() + selectedTeacher.status.slice(1)}
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
//               <div className="flex items-center gap-2">
//                 <Mail size={18} className="text-text/60" />
//                 <span className="text-text">{selectedTeacher.email}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Phone size={18} className="text-text/60" />
//                 <span className="text-text">{selectedTeacher.phone}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Building2 size={18} className="text-text/60" />
//                 <span className="text-text">{selectedTeacher.school}</span>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-blue-50 rounded-2xl p-4 text-center">
//                 <p className="text-sm text-blue-700 mb-1">Class</p>
//                 <p className="text-xl font-bold text-blue-900">{selectedTeacher.class}</p>
//               </div>
//               <div className="bg-green-50 rounded-2xl p-4 text-center">
//                 <p className="text-sm text-green-700 mb-1">Students</p>
//                 <p className="text-xl font-bold text-green-900">{selectedTeacher.students}</p>
//               </div>
//             </div>

//             {selectedTeacher.status === 'pending' && (
//               <div className="flex gap-3 mt-6">
//                 <Button 
//                   variant="primary" 
//                   icon={CheckCircle}
//                   onClick={() => handleApprove(selectedTeacher)} 
//                   className="flex-1"
//                 >
//                   Approve
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   icon={XCircle}
//                   onClick={() => handleReject(selectedTeacher)} 
//                   className="flex-1"
//                 >
//                   Reject
//                 </Button>
//               </div>
//             )}
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default TeacherManagement;







import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Avatar } from '../../../components/shared';
import { Search, Plus, CheckCircle, XCircle, Eye, Mail, Phone, Building2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../../config';

const TeacherManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/all-users`)
      .then(res => res.json())
      .then(data => {
        const formatted = data
          .filter(user => user.role === "teacher") // only teachers
          .map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            school: user.school || "N/A",
            class: user.class || "N/A",
            students: 0,
            status: user.status === "approved" ? "active" : "pending",
            joinedDate: user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "N/A",
            lastActive: "Recently"
          }));

        setTeachers(formatted);
      });
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    class: '',
    password: ''
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (teacher) => {
    await fetch(`${API_BASE_URL}/api/admin/approve/${teacher.id}`, {
      method: "PUT"
    });

    setTeachers(prev =>
      prev.map(t => t.id === teacher.id ? { ...t, status: "active" } : t)
    );

    alert(`${teacher.name} approved successfully`);
  };

  const handleReject = (teacher) => {
    if (window.confirm(`Are you sure you want to reject ${teacher.name}?`)) {
      setTeachers(teachers.filter(t => t.id !== teacher.id));
      setShowApprovalModal(false);
    }
  };

  const handleDeactivate = (teacher) => {
    if (window.confirm(`Are you sure you want to deactivate ${teacher.name}?`)) {
      setTeachers(teachers.map(t =>
        t.id === teacher.id ? { ...t, status: 'inactive' } : t
      ));
    }
  };

  const handleAddTeacher = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/add-teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      alert("Teacher added successfully");

      // reload teachers list
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error adding teacher");
    }
  };

  const handleUpdateTeacher = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/edit-teacher/${editData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editData)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg);
        return;
      }

      alert("Teacher updated successfully");

      setTeachers(prev =>
        prev.map(t => t.id === editData.id ? editData : t)
      );

      setShowEditModal(false);

    } catch (err) {
      console.error(err);
      alert("Error updating teacher");
    }
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    pending: teachers.filter(t => t.status === 'pending').length,
    inactive: teachers.filter(t => t.status === 'inactive').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text mb-2">Teacher Management</h1>
          <p className="text-text/60">Manage teacher accounts and approvals</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Total Teachers</p>
          <p className="text-4xl font-bold text-blue-900">{stats.total}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-700 mb-1">Active</p>
          <p className="text-4xl font-bold text-green-900">{stats.active}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Pending Approval</p>
          <p className="text-4xl font-bold text-yellow-900">{stats.pending}</p>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <p className="text-sm text-gray-700 mb-1">Inactive</p>
          <p className="text-4xl font-bold text-gray-900">{stats.inactive}</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Search by name or email..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-text">Teacher</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Contact</th>
                <th className="text-left py-4 px-4 font-semibold text-text">School</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Class</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Students</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Status</th>
                <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, index) => (
                <tr
                  key={teacher.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" />
                      <div>
                        <p className="font-semibold text-text">{teacher.name}</p>
                        <p className="text-sm text-text/60">Joined: {teacher.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-sm text-text flex items-center gap-1">
                        <Mail size={14} className="text-text/60" />
                        {teacher.email}
                      </p>
                      <p className="text-sm text-text flex items-center gap-1">
                        <Phone size={14} className="text-text/60" />
                        {teacher.phone}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-text flex items-center gap-1">
                      <Building2 size={14} className="text-text/60" />
                      {teacher.school}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-text/70">{teacher.class}</td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-text">{teacher.students}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1
                      ${teacher.status === 'active' ? 'bg-green-100 text-green-700' :
                        teacher.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'}
                    `}>
                      {teacher.status === 'active' && <CheckCircle size={14} />}
                      {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowApprovalModal(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditData(teacher);
                          setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {teacher.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(teacher)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(teacher)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} className="text-red-600" />
                          </button>
                          
                        </>
                      )}
                      {teacher.status === 'active' && (
                        <button
                          onClick={() => handleDeactivate(teacher)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <XCircle size={18} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Teacher"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            icon={Mail}
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            icon={Phone}
            type="tel"
            placeholder="Enter phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="School Name"
            icon={Building2}
            placeholder="Enter school name"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
          />
          <Input
            label="Class"
            placeholder="e.g., Junior KG-A"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={handleAddTeacher} className="flex-1">
              Add Teacher
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {editData && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Teacher"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />

            <Input
              label="Email"
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            />

            <Input
              label="Phone"
              value={editData.phone}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
            />

            <Input
              label="School"
              value={editData.school}
              onChange={(e) =>
                setEditData({ ...editData, school: e.target.value })
              }
            />

            <Input
              label="Class"
              value={editData.class}
              onChange={(e) =>
                setEditData({ ...editData, class: e.target.value })
              }
            />

            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleUpdateTeacher} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* View/Approval Modal */}
      {selectedTeacher && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title="Teacher Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar size="xl" />
              <div>
                <h3 className="text-2xl font-bold text-text">{selectedTeacher.name}</h3>
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1
                  ${selectedTeacher.status === 'active' ? 'bg-green-100 text-green-700' :
                    selectedTeacher.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'}
                `}>
                  {selectedTeacher.status.charAt(0).toUpperCase() + selectedTeacher.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-text/60" />
                <span className="text-text">{selectedTeacher.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-text/60" />
                <span className="text-text">{selectedTeacher.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-text/60" />
                <span className="text-text">{selectedTeacher.school}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Class</p>
                <p className="text-xl font-bold text-blue-900">{selectedTeacher.class}</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Students</p>
                <p className="text-xl font-bold text-green-900">{selectedTeacher.students}</p>
              </div>
            </div>

            {selectedTeacher.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  icon={CheckCircle}
                  onClick={() => handleApprove(selectedTeacher)}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  icon={XCircle}
                  onClick={() => handleReject(selectedTeacher)}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherManagement;