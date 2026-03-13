// import React, { useState } from 'react';
// import { Card, Button, Input, Modal, Avatar } from '../../../components/shared';
// import { Search, CheckCircle, XCircle, Eye, Mail, Phone, User } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ParentManagement = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [showApprovalModal, setShowApprovalModal] = useState(false);
//   const [selectedParent, setSelectedParent] = useState(null);

//   const [parents, setParents] = useState([
//     {
//       id: 1,
//       name: 'Mr. Rajesh Sharma',
//       email: 'rajesh.sharma@email.com',
//       phone: '9876543210',
//       childName: 'Aarav Sharma',
//       childClass: 'Junior KG-A',
//       status: 'active',
//       joinedDate: '2025-01-20'
//     },
//     {
//       id: 2,
//       name: 'Mrs. Anjali Patel',
//       email: 'anjali.patel@email.com',
//       phone: '9876543211',
//       childName: 'Priya Patel',
//       childClass: 'Junior KG-A',
//       status: 'active',
//       joinedDate: '2025-01-22'
//     },
//     {
//       id: 3,
//       name: 'Mr. Vijay Kumar',
//       email: 'vijay.kumar@email.com',
//       phone: '9876543212',
//       childName: 'Rohan Kumar',
//       childClass: 'Junior KG-B',
//       status: 'active',
//       joinedDate: '2025-02-01'
//     },
//     {
//       id: 4,
//       name: 'Mrs. Neha Gupta',
//       email: 'neha.gupta@email.com',
//       phone: '9876543213',
//       childName: 'Sara Gupta',
//       childClass: 'Junior KG-A',
//       status: 'pending',
//       joinedDate: '2026-02-15'
//     },
//     {
//       id: 5,
//       name: 'Mr. Vikram Patel',
//       email: 'vikram.patel@email.com',
//       phone: '9876543214',
//       childName: 'Ananya Patel',
//       childClass: 'Junior KG-C',
//       status: 'pending',
//       joinedDate: '2026-02-14'
//     },
//   ]);

//   const filteredParents = parents.filter(parent => {
//     const matchesSearch = parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          parent.childName.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || parent.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const handleApprove = (parent) => {
//     setParents(parents.map(p => 
//       p.id === parent.id ? { ...p, status: 'active' } : p
//     ));
//     setShowApprovalModal(false);
//     alert(`${parent.name} has been approved!`);
//   };

//   const handleReject = (parent) => {
//     if (window.confirm(`Are you sure you want to reject ${parent.name}?`)) {
//       setParents(parents.filter(p => p.id !== parent.id));
//       setShowApprovalModal(false);
//     }
//   };

//   const stats = {
//     total: parents.length,
//     active: parents.filter(p => p.status === 'active').length,
//     pending: parents.filter(p => p.status === 'pending').length,
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-4xl font-bold text-text mb-2">Parent Management</h1>
//         <p className="text-text/60">Manage parent accounts and approvals</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-3 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <p className="text-sm text-blue-700 mb-1">Total Parents</p>
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
//       </div>

//       {/* Search and Filter */}
//       <Card>
//         <div className="grid grid-cols-2 gap-4">
//           <Input
//             placeholder="Search by name, email, or child name..."
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
//           </select>
//         </div>
//       </Card>

//       {/* Parents Table */}
//       <Card>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-200">
//                 <th className="text-left py-4 px-4 font-semibold text-text">Parent</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Contact</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Child</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Class</th>
//                 <th className="text-left py-4 px-4 font-semibold text-text">Status</th>
//                 <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredParents.map((parent, index) => (
//                 <motion.tr
//                   key={parent.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                   className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="py-4 px-4">
//                     <div className="flex items-center gap-3">
//                       <Avatar size="md" />
//                       <div>
//                         <p className="font-semibold text-text">{parent.name}</p>
//                         <p className="text-sm text-text/60">Joined: {parent.joinedDate}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="space-y-1">
//                       <p className="text-sm text-text flex items-center gap-1">
//                         <Mail size={14} className="text-text/60" />
//                         {parent.email}
//                       </p>
//                       <p className="text-sm text-text flex items-center gap-1">
//                         <Phone size={14} className="text-text/60" />
//                         {parent.phone}
//                       </p>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <p className="font-semibold text-text">{parent.childName}</p>
//                   </td>
//                   <td className="py-4 px-4 text-text/70">{parent.childClass}</td>
//                   <td className="py-4 px-4">
//                     <span className={`
//                       px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1
//                       ${parent.status === 'active' ? 'bg-green-100 text-green-700' :
//                         'bg-yellow-100 text-yellow-700'}
//                     `}>
//                       {parent.status === 'active' && <CheckCircle size={14} />}
//                       {parent.status.charAt(0).toUpperCase() + parent.status.slice(1)}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center justify-end gap-2">
//                       <button
//                         onClick={() => {
//                           setSelectedParent(parent);
//                           setShowApprovalModal(true);
//                         }}
//                         className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
//                         title="View Details"
//                       >
//                         <Eye size={18} className="text-blue-600" />
//                       </button>
//                       {parent.status === 'pending' && (
//                         <>
//                           <button
//                             onClick={() => handleApprove(parent)}
//                             className="p-2 hover:bg-green-50 rounded-lg transition-colors"
//                             title="Approve"
//                           >
//                             <CheckCircle size={18} className="text-green-600" />
//                           </button>
//                           <button
//                             onClick={() => handleReject(parent)}
//                             className="p-2 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Reject"
//                           >
//                             <XCircle size={18} className="text-red-600" />
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 </motion.tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card>

//       {/* View/Approval Modal */}
//       {selectedParent && (
//         <Modal
//           isOpen={showApprovalModal}
//           onClose={() => setShowApprovalModal(false)}
//           title="Parent Details"
//           size="md"
//         >
//           <div className="space-y-4">
//             <div className="flex items-center gap-4 pb-4 border-b">
//               <Avatar size="xl" />
//               <div>
//                 <h3 className="text-2xl font-bold text-text">{selectedParent.name}</h3>
//                 <span className={`
//                   inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1
//                   ${selectedParent.status === 'active' ? 'bg-green-100 text-green-700' :
//                     'bg-yellow-100 text-yellow-700'}
//                 `}>
//                   {selectedParent.status.charAt(0).toUpperCase() + selectedParent.status.slice(1)}
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
//               <div className="flex items-center gap-2">
//                 <Mail size={18} className="text-text/60" />
//                 <span className="text-text">{selectedParent.email}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Phone size={18} className="text-text/60" />
//                 <span className="text-text">{selectedParent.phone}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <User size={18} className="text-text/60" />
//                 <span className="text-text">Child: {selectedParent.childName}</span>
//               </div>
//             </div>

//             <div className="bg-blue-50 rounded-2xl p-4 text-center">
//               <p className="text-sm text-blue-700 mb-1">Child's Class</p>
//               <p className="text-xl font-bold text-blue-900">{selectedParent.childClass}</p>
//             </div>

//             {selectedParent.status === 'pending' && (
//               <div className="flex gap-3 mt-6">
//                 <Button 
//                   variant="primary" 
//                   icon={CheckCircle}
//                   onClick={() => handleApprove(selectedParent)} 
//                   className="flex-1"
//                 >
//                   Approve
//                 </Button>
//                 <Button 
//                   variant="outline" 
//                   icon={XCircle}
//                   onClick={() => handleReject(selectedParent)} 
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

// export default ParentManagement;



import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Avatar } from '../../../components/shared';
import { Search, CheckCircle, XCircle, Eye, Mail, Phone, User } from 'lucide-react';
import { motion } from 'framer-motion';

const ParentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  const [parents, setParents] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/all-users")
      .then(res => res.json())
      .then(data => {
        const parentsOnly = data.filter(user => user.role === "parent"); // ⭐ FIX

        const formatted = parentsOnly.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          childName: user.child_name || "N/A",
          childClass: user.child_class || "N/A",
          status: user.status === "approved" ? "active" : "pending",
          joinedDate: user.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "N/A"
        }));

        setParents(formatted);
      });
  }, []);

  useEffect(() => {
    if (selectedParent) {
      setEditForm(selectedParent);
    }
  }, [selectedParent]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/all-students")
      .then(res => res.json())
      .then(data => {
        setStudents(data);
      })
      .catch(err => console.error("Student fetch error", err));
  }, []);


  const filteredParents = parents.filter(parent => {
    const matchesSearch = parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.childName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || parent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getChildrenOfParent = (parentId) => {
    if (!parentId) return [];
    return students.filter((student) => {
      // String conversion zaroori hai taaki ID format match ho jaye
      return String(student.parent_id) === String(parentId);
    });
  };

  const handleApprove = async (parent) => {
    await fetch(`http://localhost:5000/api/admin/approve/${parent.id}`, {
      method: "PUT"
    });

    setParents(prev =>
      prev.map(p => p.id === parent.id ? { ...p, status: "active" } : p)
    );

    alert(`${parent.name} approved successfully`);
  };

  const handleReject = (parent) => {
    if (window.confirm(`Are you sure you want to reject ${parent.name}?`)) {
      setParents(parents.filter(p => p.id !== parent.id));
      setShowApprovalModal(false);
    }
  };

  const handleUpdateParent = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/edit-parent/${editForm.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );

      const data = await res.json();

      alert(data.msg || "Parent updated successfully");

      // close modal
      setShowEditModal(false);

      // update UI without reload
      setParents(prev =>
        prev.map(p =>
          p.id === editForm.id ? { ...p, ...editForm } : p
        )
      );

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const stats = {
    total: parents.length,
    active: parents.filter(p => p.status === 'active').length,
    pending: parents.filter(p => p.status === 'pending').length,
  };

  console.log("Parents:", parents);
  console.log("Students:", students);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text mb-2">Parent Management</h1>
        <p className="text-text/60">Manage parent accounts and approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Total Parents</p>
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
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Search by name, email, or child name..."
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
          </select>
        </div>
      </Card>


      {/* Parents Table */}
      <Card>
        <div className="overflow-x-auto">

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-text">Parent</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Contact</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Child</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Class</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Status</th>
                <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((parent, index) => (
                <motion.tr
                  key={parent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" />
                      <div>
                        <p className="font-semibold text-text">{parent.name}</p>
                        <p className="text-sm text-text/60">Joined: {parent.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-sm text-text flex items-center gap-1">
                        <Mail size={14} className="text-text/60" />
                        {parent.email}
                      </p>
                      <p className="text-sm text-text flex items-center gap-1">
                        <Phone size={14} className="text-text/60" />
                        {parent.phone}
                      </p>
                    </div>
                  </td>
                  {/* Child Column - Loop ke andar (approx Line 155) */}
                  <td className="py-4 px-4">
                    {(() => {
                      const parentChildren = getChildrenOfParent(parent.id); // Yahan parent.id use karein
                      return parentChildren.length === 0 ? (
                        <span className="text-gray-400 italic">No Child Linked</span>
                      ) : (
                        parentChildren.map((child) => (
                          <p key={child._id} className="font-semibold text-text">
                            {child.name}
                          </p>
                        ))
                      );
                    })()}
                  </td>

                  {/* Class Column - Loop ke andar (approx Line 170) */}
                  <td className="py-4 px-4 text-text/70">
                    {(() => {
                      const parentChildren = getChildrenOfParent(parent.id);
                      return parentChildren.length === 0 ? (
                        <p className="text-gray-400">-</p>
                      ) : (
                        parentChildren.map(child => (
                          <p key={child._id} className="text-sm">
                            {child.class}
                          </p>
                        ))
                      );
                    })()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1
                      ${parent.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'}
                    `}>
                      {parent.status === 'active' && <CheckCircle size={14} />}
                      {parent.status.charAt(0).toUpperCase() + parent.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedParent(parent);
                          setShowApprovalModal(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditForm(parent);
                          setShowEditModal(true);
                        }}
                        className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {parent.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(parent)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(parent)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} className="text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View/Approval Modal */}
      {selectedParent && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title="Parent Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar size="xl" />
              <div>
                <h3 className="text-2xl font-bold text-text">{selectedParent.name}</h3>
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1
                  ${selectedParent.status === 'active' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'}
                `}>
                  {selectedParent.status.charAt(0).toUpperCase() + selectedParent.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-text/60" />
                <span className="text-text">{selectedParent.email}</span>

              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-text/60" />
                <span className="text-text">{selectedParent.phone}</span>

              </div>
              <div className="flex items-center gap-2">
                <User size={18} className="text-text/60" />
                <span className="text-text">Child: {getChildrenOfParent(selectedParent.id).map(child => (
                  <p key={child._id}>{child.name}</p>
                ))}</span>

              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-sm text-blue-700 mb-1">Child's Class</p>
              <p className="text-xl font-bold text-blue-900">{selectedParent.childClass}</p>

            </div>

            {selectedParent.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  icon={CheckCircle}
                  onClick={() => handleApprove(selectedParent)}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  icon={XCircle}
                  onClick={() => handleReject(selectedParent)}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editForm && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Parent"
          size="md"
        >
          <div className="space-y-4">

            <Input
              label="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />

            <Input
              label="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />

            <Input
              label="Phone"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
            <div>
              <label className="text-sm font-semibold">Child</label>
              <select
                className="w-full border rounded-lg p-2 mt-1"
                value={editForm.childName || ""}
                onChange={(e) => {
                  const selectedStudent = students.find(s => s.name === e.target.value);

                  setEditForm({
                    ...editForm,
                    childName: selectedStudent?.name,
                    childClass: selectedStudent?.class || ""
                  });
                }}
              >
                <option value="">Select Child</option>
                {students.map(student => (
                  <option key={student._id} value={student.name}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Child Class"
              value={editForm.childClass}
              onChange={(e) =>
                setEditForm({ ...editForm, childClass: e.target.value })
              }
            />

            {/* Status Dropdown */}
            <select
              className="w-full border rounded-lg p-2"
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value })
              }
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleUpdateParent}
            >
              Save Changes
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ParentManagement;