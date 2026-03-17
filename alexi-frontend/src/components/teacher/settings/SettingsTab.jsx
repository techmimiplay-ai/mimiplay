import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Button, Card, Input, Avatar } from '../../../components/shared';
import { User, Mail, Phone, Lock, Bell, Monitor, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsTab = () => {
  const [activeTab,    setActiveTab]    = useState('profile');
  const [loading,      setLoading]      = useState(true);
  const [saveMsg,      setSaveMsg]      = useState('');
  const [saveError,    setSaveError]    = useState('');

  const teacherId = localStorage.getItem('userId') || localStorage.getItem('user_id');

  const [profileData, setProfileData] = useState({
    fullName: '', email: '', phone: '',
    school: '', class: '', subject: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications:   false,
    weeklyReports:      true,
    studentUpdates:     true,
    autoAttendance:     true,
    soundEffects:       true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  // ── Fetch profile ───────────────────────────────────────────
  useEffect(() => {
    if (!teacherId) return;
    fetchProfile();
  }, [teacherId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/profile?teacher_id=${teacherId}`
      );
      if (res.data?.status === 'success') {
        setProfileData(res.data.profile);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Show message helper ─────────────────────────────────────
  const showMsg = (msg, isError = false) => {
    if (isError) { setSaveError(msg); setTimeout(() => setSaveError(''), 3000); }
    else         { setSaveMsg(msg);   setTimeout(() => setSaveMsg(''),   3000); }
  };

  // ── Save profile ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/teacher/profile?teacher_id=${teacherId}`,
        profileData
      );
      showMsg('✅ Profile updated successfully!');
    } catch (err) {
      showMsg('❌ Could not save profile', true);
    }
  };

  // ── Change password ─────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showMsg('❌ Please fill all fields', true); return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMsg('❌ Passwords do not match', true); return;
    }
    if (passwordData.newPassword.length < 6) {
      showMsg('❌ Password must be at least 6 characters', true); return;
    }
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/teacher/change-password?teacher_id=${teacherId}`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }
      );
      if (res.data?.status === 'success') {
        showMsg('✅ Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMsg(`❌ ${res.data?.message || 'Failed'}`, true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not change password';
      showMsg(`❌ ${msg}`, true);
    }
  };

  // ── Initials ────────────────────────────────────────────────
  const initials = profileData.fullName
    ? profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
        <p className="text-text/60">Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text mb-2">Settings ⚙️</h1>
        <p className="text-text/60">Manage your account and preferences</p>
      </div>

      {/* Success / Error message */}
      {saveMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 text-green-800 px-4 py-3 rounded-xl border-2 border-green-300 font-semibold">
          {saveMsg}
        </motion.div>
      )}
      {saveError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 text-red-800 px-4 py-3 rounded-xl border-2 border-red-300 font-semibold">
          {saveError}
        </motion.div>
      )}

      {/* Tabs */}
      <Card padding="none">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'profile',     label: 'Profile',     icon: User    },
            { id: 'preferences', label: 'Preferences', icon: Bell    },
            { id: 'security',    label: 'Security',    icon: Lock    },
            { id: 'classroom',   label: 'Classroom',   icon: Monitor },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors relative ${
                  activeTab === tab.id ? 'text-primary-600' : 'text-text/60 hover:text-text'
                }`}>
                <Icon size={20} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Profile Tab ──────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text mb-1">
                  {profileData.fullName || 'Teacher'}
                </h3>
                <p className="text-text/60 mb-1">{profileData.email}</p>
                <p className="text-text/50 text-sm">{profileData.school}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" icon={User}
                value={profileData.fullName}
                onChange={e => setProfileData({ ...profileData, fullName: e.target.value })} />
              <Input label="Email Address" icon={Mail} type="email"
                value={profileData.email}
                onChange={e => setProfileData({ ...profileData, email: e.target.value })} />
              <Input label="Phone Number" icon={Phone} type="tel"
                value={profileData.phone}
                onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
              <Input label="School Name"
                value={profileData.school}
                onChange={e => setProfileData({ ...profileData, school: e.target.value })} />
              <Input label="Class"
                value={profileData.class}
                onChange={e => setProfileData({ ...profileData, class: e.target.value })} />
              <Input label="Subject"
                value={profileData.subject}
                onChange={e => setProfileData({ ...profileData, subject: e.target.value })} />
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="primary" icon={Save} onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Preferences Tab ──────────────────────────────────── */}
      {activeTab === 'preferences' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold text-text mb-4">Notifications</h3>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email'            },
                { key: 'smsNotifications',   label: 'SMS Notifications',   desc: 'Receive updates via SMS'              },
                { key: 'weeklyReports',      label: 'Weekly Reports',      desc: 'Get weekly progress reports'          },
                { key: 'studentUpdates',     label: 'Student Updates',     desc: 'Notifications about student activities'},
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-text">{pref.label}</h4>
                    <p className="text-sm text-text/60">{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={preferences[pref.key]}
                      onChange={e => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-text mb-4">Classroom Settings</h3>
            <div className="space-y-4">
              {[
                { key: 'autoAttendance', label: 'Auto Attendance', desc: 'Automatically mark attendance via face recognition' },
                { key: 'soundEffects',   label: 'Sound Effects',   desc: 'Enable sound effects in activities'                 },
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-text">{pref.label}</h4>
                    <p className="text-sm text-text/60">{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={preferences[pref.key]}
                      onChange={e => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="primary" icon={Save} onClick={() => showMsg('✅ Preferences saved!')}>
                Save Preferences
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Security Tab ─────────────────────────────────────── */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold text-text mb-4">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <Input label="Current Password" type="password" icon={Lock}
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
              <Input label="New Password" type="password" icon={Lock}
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
              <Input label="Confirm New Password" type="password" icon={Lock}
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
              <Button variant="primary" className="w-full" onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Security Tips</h4>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Use a strong password with at least 8 characters</li>
                  <li>Include uppercase, lowercase, numbers, and symbols</li>
                  <li>Don't share your password with anyone</li>
                  <li>Change your password regularly</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Classroom Tab ────────────────────────────────────── */}
      {activeTab === 'classroom' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold text-text mb-4">Smart TV Configuration</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Monitor size={24} className="text-blue-600" />
                  <h4 className="font-semibold text-blue-900">TV Connection Status</h4>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  Connect your Smart TV to display Mimi and classroom activities
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700">Connected</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-text/60 mb-1">Display Resolution</p>
                  <p className="text-lg font-semibold text-text">1920 × 1080 (Full HD)</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-text/60 mb-1">Screen Mode</p>
                  <p className="text-lg font-semibold text-text">Fullscreen</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Default Activity Duration (minutes)
                </label>
                <input type="number" defaultValue={15}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Voice Volume</label>
                <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-text mb-4">Camera Settings</h3>
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
              <h4 className="font-semibold text-purple-900 mb-2">Face Recognition</h4>
              <p className="text-sm text-purple-800 mb-3">
                Camera is used for automatic student recognition and attendance
              </p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-700">Camera Active</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

    </div>
  );
};

export default SettingsTab;