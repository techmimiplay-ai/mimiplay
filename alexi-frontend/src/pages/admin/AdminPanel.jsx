import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, GraduationCap  } from 'lucide-react';
import { motion } from 'framer-motion';

// Admin Pages
import AdminDashboard from '../../components/admin/dashboard/AdminDashboard';
import TeacherManagement from '../../components/admin/teachers/TeacherManagement';
import ParentManagement from '../../components/admin/parents/ParentManagement';
import StudentManagement from '../../components/admin/students/StudentManagement';
import SystemSettings from '../../components/admin/settings/SystemSettings';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'purple' },
    { path: '/admin/teachers', icon: Users, label: 'Teachers', color: 'blue' },
    { path: '/admin/parents', icon: UserPlus, label: 'Parents', color: 'green' },
    { path: '/admin/students', icon: GraduationCap, label: 'Students', color: 'orange' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', color: 'gray' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      navigate('/login');
    }
  };

  const getColorClasses = (color, active) => {
    const colors = {
      purple: active ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      blue: active ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: active ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
      orange: active ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      gray: active ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Bar - Full Width */}
      <div className="bg-white border-b-2 border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display font-bold text-gradient">Alexi Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
          >
            <LogOut size={20} className="text-red-600" />
          </button>
        </div>
      </div>

      {/* Tab Navigation - Full Width */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 px-8 py-3">
        <div className="flex items-center gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                  ${getColorClasses(tab.color, active)}
                `}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="px-8 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="parents" element={<ParentManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="settings" element={<SystemSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;