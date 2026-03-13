// import React from 'react';
// import { Card, Button } from '../../../components/shared';
// import { Users, UserPlus, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
// import { motion } from 'framer-motion';

// const AdminDashboard = () => {
//   const stats = {
//     totalTeachers: 5,
//     totalParents: 45,
//     totalStudents: 90,
//     pendingApprovals: 7,
//     activeToday: 78,
//     systemHealth: 'Excellent'
//   };

//   const pendingApprovals = [
//     { id: 1, type: 'teacher', name: 'Mr. Rahul Verma', email: 'rahul.v@school.com', date: '2 hours ago' },
//     { id: 2, type: 'parent', name: 'Mrs. Anjali Mehta', email: 'anjali.m@email.com', date: '5 hours ago' },
//     { id: 3, type: 'teacher', name: 'Ms. Sneha Kapoor', email: 'sneha.k@school.com', date: '1 day ago' },
//     { id: 4, type: 'parent', name: 'Mr. Vikram Patel', email: 'vikram.p@email.com', date: '1 day ago' },
//   ];

//   const recentActivity = [
//     { action: 'New teacher registered', user: 'Mr. Rahul Verma', time: '2 hours ago', type: 'info' },
//     { action: 'Parent approved', user: 'Mrs. Priya Shah', time: '3 hours ago', type: 'success' },
//     { action: 'Student added', user: 'Rohan Kumar (Roll: 045)', time: '5 hours ago', type: 'success' },
//     { action: 'New parent registered', user: 'Mr. Vikram Patel', time: '1 day ago', type: 'info' },
//   ];

//   const systemStats = [
//     { label: 'API Response Time', value: '45ms', status: 'good' },
//     { label: 'Database Load', value: '23%', status: 'good' },
//     { label: 'Storage Used', value: '2.4 GB', status: 'good' },
//     { label: 'Active Sessions', value: '12', status: 'good' },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-4xl font-bold text-text mb-2">Admin Dashboard</h1>
//         <p className="text-text/60">System overview and management</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <Users size={24} className="text-blue-600 mb-2" />
//           <p className="text-3xl font-bold text-blue-900">{stats.totalTeachers}</p>
//           <p className="text-sm text-blue-700">Teachers</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//           <UserPlus size={24} className="text-green-600 mb-2" />
//           <p className="text-3xl font-bold text-green-900">{stats.totalParents}</p>
//           <p className="text-sm text-green-700">Parents</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
//           <Users size={24} className="text-purple-600 mb-2" />
//           <p className="text-3xl font-bold text-purple-900">{stats.totalStudents}</p>
//           <p className="text-sm text-purple-700">Students</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//           <Clock size={24} className="text-yellow-600 mb-2" />
//           <p className="text-3xl font-bold text-yellow-900">{stats.pendingApprovals}</p>
//           <p className="text-sm text-yellow-700">Pending</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
//           <TrendingUp size={24} className="text-cyan-600 mb-2" />
//           <p className="text-3xl font-bold text-cyan-900">{stats.activeToday}</p>
//           <p className="text-sm text-cyan-700">Active Today</p>
//         </Card>

//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//           <CheckCircle size={24} className="text-green-600 mb-2" />
//           <p className="text-lg font-bold text-green-900">{stats.systemHealth}</p>
//           <p className="text-sm text-green-700">System Health</p>
//         </Card>
//       </div>

//       {/* Pending Approvals */}
//       {pendingApprovals.length > 0 && (
//         <Card className="border-yellow-200 bg-yellow-50">
//           <div className="flex items-center gap-3 mb-4">
//             <AlertCircle size={28} className="text-yellow-600" />
//             <div>
//               <h2 className="text-2xl font-bold text-text">Pending Approvals</h2>
//               <p className="text-sm text-text/60">Review and approve new registrations</p>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {pendingApprovals.map((item, index) => (
//               <motion.div
//                 key={item.id}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="flex items-center justify-between p-4 bg-white rounded-2xl"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className={`
//                     w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
//                     ${item.type === 'teacher' ? 'bg-blue-500' : 'bg-green-500'}
//                   `}>
//                     {item.type === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-text">{item.name}</h3>
//                     <p className="text-sm text-text/60">{item.email}</p>
//                     <p className="text-xs text-text/50">{item.date}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button size="sm" variant="primary">
//                     Approve
//                   </Button>
//                   <Button size="sm" variant="outline">
//                     Reject
//                   </Button>
//                 </div>
//               </motion.div>
//             ))}
//           </div>

//           <div className="mt-4">
//             <Button variant="outline" className="w-full">
//               View All Pending ({pendingApprovals.length})
//             </Button>
//           </div>
//         </Card>
//       )}

//       <div className="grid grid-cols-2 gap-6">
//         {/* Recent Activity */}
//         <Card>
//           <h2 className="text-2xl font-bold text-text mb-4">Recent Activity</h2>
//           <div className="space-y-3">
//             {recentActivity.map((activity, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
//               >
//                 <div className={`
//                   w-8 h-8 rounded-full flex items-center justify-center mt-1
//                   ${activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}
//                 `}>
//                   {activity.type === 'success' ? (
//                     <CheckCircle size={16} className="text-green-600" />
//                   ) : (
//                     <AlertCircle size={16} className="text-blue-600" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-semibold text-text">{activity.action}</p>
//                   <p className="text-sm text-text/60">{activity.user}</p>
//                   <p className="text-xs text-text/50 mt-1">{activity.time}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </Card>

//         {/* System Status */}
//         <Card>
//           <h2 className="text-2xl font-bold text-text mb-4">System Status</h2>
//           <div className="space-y-4">
//             {systemStats.map((stat, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                 <span className="text-sm font-semibold text-text">{stat.label}</span>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-bold text-text">{stat.value}</span>
//                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
//             <div className="flex items-center gap-2">
//               <CheckCircle size={20} className="text-green-600" />
//               <p className="text-sm font-semibold text-green-900">All systems operational</p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React from 'react';
import { Card, Button } from '../../../components/shared';
import { Users, UserPlus, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {

  const [stats, setStats] = useState({});
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const recentActivity = [
    { action: 'New teacher registered', user: 'Mr. Rahul Verma', time: '2 hours ago', type: 'info' },
    { action: 'Parent approved', user: 'Mrs. Priya Shah', time: '3 hours ago', type: 'success' },
    { action: 'Student added', user: 'Rohan Kumar (Roll: 045)', time: '5 hours ago', type: 'success' },
    { action: 'New parent registered', user: 'Mr. Vikram Patel', time: '1 day ago', type: 'info' },
  ];

  const systemStats = [
    { label: 'API Response Time', value: '45ms', status: 'good' },
    { label: 'Database Load', value: '23%', status: 'good' },
    { label: 'Storage Used', value: '2.4 GB', status: 'good' },
    { label: 'Active Sessions', value: '12', status: 'good' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await axios.get("http://localhost:5000/api/admin/dashboard-stats");
      setStats(statsRes.data);

      const pendingRes = await axios.get("http://localhost:5000/api/admin/pending-users");
      setPendingApprovals(pendingRes.data);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text mb-2">Admin Dashboard</h1>
        <p className="text-text/60">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <Users size={24} className="text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-blue-900">{stats?.totalTeachers || 0}</p>
          <p className="text-sm text-blue-700">Teachers</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <UserPlus size={24} className="text-green-600 mb-2" />
          <p className="text-3xl font-bold text-green-900">{stats?.totalParents || 0}</p>
          <p className="text-sm text-green-700">Parents</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <Users size={24} className="text-purple-600 mb-2" />
          <p className="text-3xl font-bold text-purple-900">{stats?.totalStudents || 0}</p>
          <p className="text-sm text-purple-700">Students</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <Clock size={24} className="text-yellow-600 mb-2" />
          <p className="text-3xl font-bold text-yellow-900">{stats?.pendingApprovals || 0}</p>
          <p className="text-sm text-yellow-700">Pending</p>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <TrendingUp size={24} className="text-cyan-600 mb-2" />
          <p className="text-3xl font-bold text-cyan-900">{stats?.activeToday || 0}</p>
          <p className="text-sm text-cyan-700">Active Today</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CheckCircle size={24} className="text-green-600 mb-2" />
          <p className="text-lg font-bold text-green-900">{stats.systemHealth}</p>
          <p className="text-sm text-green-700">System Health</p>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={28} className="text-yellow-600" />
            <div>
              <h2 className="text-2xl font-bold text-text">Pending Approvals</h2>
              <p className="text-sm text-text/60">Review and approve new registrations</p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                    ${item.type === 'teacher' ? 'bg-blue-500' : 'bg-green-500'}
                  `}>
                    {item.type === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{item.name}</h3>
                    <p className="text-sm text-text/60">{item.email}</p>
                    <p className="text-xs text-text/50">{item.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    Reject
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Pending ({pendingApprovals.length})
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <h2 className="text-2xl font-bold text-text mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center mt-1
                  ${activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}
                `}>
                  {activity.type === 'success' ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">{activity.action}</p>
                  <p className="text-sm text-text/60">{activity.user}</p>
                  <p className="text-xs text-text/50 mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* System Status */}
        <Card>
          <h2 className="text-2xl font-bold text-text mb-4">System Status</h2>
          <div className="space-y-4">
            {systemStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-text">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text">{stat.value}</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-sm font-semibold text-green-900">All systems operational</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;