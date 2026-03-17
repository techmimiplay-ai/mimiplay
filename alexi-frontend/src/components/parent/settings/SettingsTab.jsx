import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Button, Card, Input } from '../../shared';
import { Save, User, Mail, Phone, Lock, Bell, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsTab = () => {

  const [formData, setFormData] = useState({
    name:           '',
    email:          '',
    phone:          '',
    occupation:     '',
    notifications:  true,
    weeklyReports:  true,
    progressAlerts: true,
    theme:          'light',
    language:       'english',
  });

  const [loading,     setLoading]     = useState(true);
  const [saveStatus,  setSaveStatus]  = useState('');
  const [error,       setError]       = useState('');

  const parentId = localStorage.getItem('userId') || localStorage.getItem('user_id');

  // ── Profile fetch karo ──────────────────────────────────────
  useEffect(() => {
    if (!parentId) return;
    fetchProfile();
  }, [parentId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/profile?parent_id=${parentId}`
      );
      if (res.data?.status === 'success') {
        const p = res.data.profile;
        setFormData(prev => ({
          ...prev,
          name:       p.name       || '',
          email:      p.email      || '',
          phone:      p.phone      || '',
          occupation: p.occupation || '',
        }));
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Could not load profile. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...');
      await axios.put(
        `${API_BASE_URL}/api/parent/profile?parent_id=${parentId}`,
        {
          name:       formData.name,
          email:      formData.email,
          phone:      formData.phone,
          occupation: formData.occupation,
        }
      );
      setSaveStatus('✅ Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('❌ Save failed. Try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
        <p className="text-text/60">Loading your profile...</p>
      </div>
    </div>
  );

  // ── Initials for avatar ─────────────────────────────────────
  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text mb-2">Settings ⚙️</h1>
        <p className="text-text/60">Manage your account and preferences</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Save Status */}
      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 text-green-800 px-4 py-3 rounded-xl border-2 border-green-300 font-semibold"
        >
          {saveStatus}
        </motion.div>
      )}

      {/* Profile Settings */}
      <Card>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text">{formData.name || 'Parent'}</h3>
            <p className="text-text/60">Parent Account</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Full Name"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            name="name"
            placeholder="Your full name"
          />
          <Input
            label="Email"
            icon={Mail}
            type="email"
            value={formData.email}
            onChange={handleChange}
            name="email"
            placeholder="your@email.com"
          />
          <Input
            label="Phone"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            name="phone"
            placeholder="Phone number"
          />
          <Input
            label="Occupation"
            value={formData.occupation}
            onChange={handleChange}
            name="occupation"
            placeholder="e.g. Software Engineer"
          />
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Bell size={24} className="text-primary-600" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { name: 'notifications',  label: 'Enable Notifications', desc: "Receive updates about your child's progress" },
            { name: 'weeklyReports',  label: 'Weekly Reports',       desc: 'Get weekly progress summaries'                },
            { name: 'progressAlerts', label: 'Progress Alerts',      desc: 'Alert me about significant progress milestones' },
          ].map(item => (
            <label key={item.name}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" name={item.name}
                checked={formData[item.name]} onChange={handleChange}
                className="w-5 h-5 rounded-lg" />
              <div>
                <p className="font-semibold text-text">{item.label}</p>
                <p className="text-sm text-text/60">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Display Settings */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Palette size={24} className="text-primary-600" />
          Display Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Theme</label>
            <select name="theme" value={formData.theme} onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Language</label>
            <select name="language" value={formData.language} onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400">
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="spanish">Spanish</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Lock size={24} className="text-primary-600" />
          Security
        </h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full">Change Password</Button>
          <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
        </div>
      </Card>

      {/* Save Button */}
      <Button variant="primary" icon={Save} onClick={handleSave} className="w-full">
        Save All Changes
      </Button>

    </div>
  );
};

export default SettingsTab;