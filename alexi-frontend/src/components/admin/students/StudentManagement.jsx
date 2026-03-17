import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Avatar } from '../../../components/shared';
import { Search, Eye, Mail, Phone, User, CheckCircle, Plus, Pencil } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const StudentManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [parents, setParents] = useState([]);

    const [formData, setFormData] = useState({
        studentName: '',
        studentClass: '',
        parentName: '',
        email: '',
        phone: ''
    });

    const fetchStudents = async () => {
        const res = await fetch(`${API_BASE_URL}/api/admin/all-students`);
        const data = await res.json();

        const formatted = data.map(s => ({
            id: s._id,
            studentName: s.name,
            studentClass: s.class,
            parentName: s.parent_name || "N/A",
            parentId: s.parent_id || "",
            email: s.email || "-",
            phone: s.phone || "-",
            status: "active",
            joinedDate: s.created_at
                ? new Date(s.created_at).toLocaleDateString()
                : "N/A",
        }));

        setStudents(formatted);
    };

    const fetchParents = async () => {
        const res = await fetch(`${API_BASE_URL}/api/admin/all-users`);
        const data = await res.json();

        const onlyParents = data.filter(u => u.role === "parent");

        setParents(onlyParents);
    };

    useEffect(() => {
        fetchStudents();
        fetchParents();
    }, []);


    const handleAddStudent = async () => {
        const selectedParentObj = parents.find(p => p._id === formData.parentName);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/add-student`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.studentName,
                    class: formData.studentClass,
                    // parentName: formData.parentName,
                    parentName: selectedParentObj ? selectedParentObj.name : "",
                    parent_id: formData.parentName,
                    email: formData.email,
                    phone: formData.phone
                })
            });

            if (response.ok) {
                alert("Student added ✅");
                fetchStudents();
                setShowAddModal(false);
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    };

    const handleUpdateStudent = async () => {
        const selectedParentObj = parents.find(p => p._id === editData.parentId || p.name === editData.parentName);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/edit-student/${editData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: editData.studentName,
                    class: editData.studentClass,
                    parentName: selectedParentObj ? selectedParentObj.name : editData.parentName,
                    parent_id: editData.parentId,
                    email: editData.email,
                    phone: editData.phone
                })
            });

            if (res.ok) {
                alert("Student updated ✅");
                fetchStudents(); // refresh table
                setShowEditModal(false);
            } else {
                alert("Update failed ❌");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    };

    const handleParentChange = (e) => {
        const parentId = e.target.value;

        // Parents list mein se selected parent ki puri info nikalna
        const selectedParent = parents.find(p => p._id === parentId);

        if (selectedParent) {
            setFormData({
                ...formData,
                parentName: parentId, // Hum ID store kar rahe hain name ki jagah
                email: selectedParent.email || '',
                phone: selectedParent.phone || ''
            });
        } else {
            setFormData({ ...formData, parentName: '', email: '', phone: '' });
        }
    };

    const filteredStudents = students.filter(student =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: students.length,
        active: students.filter(s => s.status === 'active').length,
        pending: students.filter(s => s.status === 'pending').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-text mb-2">Student Management</h1>
                    <p className="text-text/60">View and manage students</p>
                </div>

                <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                    Add Student
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Total Students</p>
                    <p className="text-4xl font-bold text-blue-900">{stats.total}</p>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <p className="text-sm text-green-700 mb-1">Active</p>
                    <p className="text-4xl font-bold text-green-900">{stats.active}</p>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-1">Pending</p>
                    <p className="text-4xl font-bold text-yellow-900">{stats.pending}</p>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <Input
                    placeholder="Search by student or parent..."
                    icon={Search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-4 px-4 font-semibold">Student</th>
                                <th className="text-left py-4 px-4 font-semibold">Parent</th>
                                <th className="text-left py-4 px-4 font-semibold">Contact</th>
                                <th className="text-left py-4 px-4 font-semibold">Class</th>
                                <th className="text-left py-4 px-4 font-semibold">Status</th>
                                <th className="text-right py-4 px-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar />
                                            <div>
                                                <p className="font-semibold">{student.studentName}</p>
                                                <p className="text-sm text-text/60">Joined: {student.joinedDate}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">{student.parentName}</td>

                                    <td className="py-4 px-4">
                                        <div className="text-sm">
                                            <p className="flex items-center gap-1">
                                                <Mail size={14} /> {student.email}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Phone size={14} /> {student.phone}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">{student.studentClass}</td>

                                    <td className="py-4 px-4">
                                        <span className={`
                      px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1
                      ${student.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'}
                    `}>
                                            <CheckCircle size={14} />
                                            {student.status}
                                        </span>
                                    </td>

                                    <td className="py-4 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditData(student);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 hover:bg-indigo-50 rounded-lg"
                                        >
                                            <Pencil size={16} className="text-indigo-600" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setShowViewModal(true);
                                            }}
                                            className="p-2 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Eye size={18} className="text-blue-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showAddModal && (
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add New Student"
                    size="md"
                >
                    <div className="space-y-4">
                        <Input
                            label="Student Name"
                            icon={User}
                            value={formData.studentName}
                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        />

                        <Input
                            label="Class"
                            placeholder="e.g. UKG-A"
                            value={formData.studentClass}
                            onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Parent
                            </label>

                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />

                                <select
                                    className="w-full border rounded-full py-3 pl-12 pr-4 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={formData.parentName}
                                    // onChange={(e) =>
                                    //     setFormData({ ...formData, parentName: e.target.value })
                                    // }
                                    onChange={handleParentChange}
                                >
                                    <option value="">Select Parent</option>

                                    {parents.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Email"
                            icon={Mail}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            label="Phone"
                            icon={Phone}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />

                        <div className="flex gap-3 mt-6">
                            <Button variant="primary" className="flex-1" onClick={handleAddStudent}>
                                Add Student
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {editData && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit Student"
                    size="md"
                >
                    <div className="space-y-4">
                        <Input
                            label="Student Name"
                            value={editData.studentName}
                            onChange={(e) =>
                                setEditData({ ...editData, studentName: e.target.value })
                            }
                        />

                        <Input
                            label="Class"
                            value={editData.studentClass}
                            onChange={(e) =>
                                setEditData({ ...editData, studentClass: e.target.value })
                            }
                        />

                        <select
                            className="w-full border rounded-lg p-2"
                            // parentId use karein takki ID select ho
                            value={editData.parentId || ""}
                            onChange={(e) =>
                                setEditData({ ...editData, parentId: e.target.value })
                            }
                        >
                            <option value="">Select Parent</option>
                            {parents.map(p => (
                                <option key={p._id} value={p._id}> {/* <--- Value ID honi chahiye */}
                                    {p.name}
                                </option>
                            ))}
                        </select>

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

                        <div className="flex gap-3 mt-6">
                            <Button variant="primary" className="flex-1" onClick={handleUpdateStudent}>
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
            {/* View Modal */}
            {selectedStudent && (
                <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="Student Details"
                >
                    <div className="space-y-3">
                        <p><b>Student:</b> {selectedStudent.studentName}</p>
                        <p><b>Class:</b> {selectedStudent.studentClass}</p>
                        <p><b>Parent:</b> {selectedStudent.parentName}</p>
                        <p><b>Email:</b> {selectedStudent.email}</p>
                        <p><b>Phone:</b> {selectedStudent.phone}</p>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default StudentManagement;