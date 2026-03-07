import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import { Login, Register, ForgotPassword } from '../pages';

// Student/TV Interface
import StudentInterface from '../pages/StudentInterface';
import MimiChat from '../pages/MimiChat';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherSelection from '../pages/teacher/TeacherSelection';

// Parent Pages
import ParentPortal from '../pages/parent/ParentPortal';

// Admin Pages
import AdminPanel from '../pages/admin/AdminPanel';

// 404
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Student/TV Interface (Mimi) */}
      <Route path="/student" element={<StudentInterface />} />
      <Route path="/mimi-chat" element={<MimiChat />} />
      
      {/* Teacher Dashboard */}
      <Route path="/teacher/*" element={<TeacherDashboard />} />
      <Route path="/teacher/selection" element={<TeacherSelection />} />
      
      {/* Parent Portal */}
      <Route path="/parent/*" element={<ParentPortal />} />
      
      {/* Admin Panel */}
      <Route path="/admin/*" element={<AdminPanel />} />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;