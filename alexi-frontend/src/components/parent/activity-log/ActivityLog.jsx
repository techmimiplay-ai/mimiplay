import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Card, Button } from '../../../components/shared';
import { Calendar, Filter, Download, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const getTypeColor = (type) => {
  const colors = {
    alphabets: 'bg-purple-100 text-purple-700',
    phonics:   'bg-blue-100 text-blue-700',
    objects:   'bg-green-100 text-green-700',
    colors:    'bg-pink-100 text-pink-700',
    numbers:   'bg-orange-100 text-orange-700',
    shapes:    'bg-cyan-100 text-cyan-700',
  };
  return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700';
};

const getScoreColor = (score) => {
  if (score >= 5) return 'text-green-600';
  if (score >= 4) return 'text-blue-600';
  if (score >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

// Date label banao
function getDateLabel(dateStr) {
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today)     return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ActivityLog = ({ selectedChild }) => {

  // ── State ───────────────────────────────────────────────────
  const [allResults,    setAllResults]    = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [selectedDate,  setSelectedDate]  = useState('all');
  const [filterType,    setFilterType]    = useState('all');
  const [appliedDate,   setAppliedDate]   = useState('all');
  const [appliedType,   setAppliedType]   = useState('all');

  // ── Fetch jab bhi selectedChild badle ──────────────────────
  useEffect(() => {
    if (!selectedChild?.id) return;
    fetchActivityLog(selectedChild.id);
  }, [selectedChild?.id]);

  const fetchActivityLog = async (studentId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`
      );
      if (res.data?.status === 'success') {
        setAllResults(res.data.results || []);
      }
    } catch (err) {
      console.error('Activity log fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter Logic ────────────────────────────────────────────
  const today     = new Date().toISOString().split('T')[0];
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];

  const filteredResults = allResults.filter(r => {
    // Date filter
    if (appliedDate === 'today'  && r.date !== today)          return false;
    if (appliedDate === 'week'   && r.date < weekStart)        return false;
    if (appliedDate === 'month'  && r.date < monthStart)       return false;
    // Type filter
    if (appliedType !== 'all') {
      const name = (r.activityName || '').toLowerCase();
      if (!name.includes(appliedType)) return false;
    }
    return true;
  });

  // Results ko date ke hisaab se group karo
  const grouped = filteredResults.reduce((acc, r) => {
    const date = r.date || today;
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  const groupedDays = Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a)) // Latest pehle
    .map(date => ({ date, dateLabel: getDateLabel(date), activities: grouped[date] }));

  // ── Stats ───────────────────────────────────────────────────
  const totalActivities = filteredResults.length;
  const totalStars      = filteredResults.reduce((s, r) => s + (r.stars || 0), 0);
  const avgScore        = totalActivities > 0
    ? (filteredResults.reduce((s, r) => s + (r.stars || 0), 0) / totalActivities).toFixed(1)
    : '—';

  // ── No child selected ───────────────────────────────────────
  if (!selectedChild) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3">📚</div>
        <p className="text-text/60 font-semibold">No child selected</p>
        <p className="text-sm text-text/40 mt-1">Please select a child from the top menu</p>
      </div>
    </div>
  );

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
        <p className="text-text/60">Loading activity log...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text mb-2">
            {selectedChild.name}'s Activity Log 📚
          </h1>
          <p className="text-text/60">Complete history of learning activities</p>
        </div>
        <Button variant="outline" icon={Download} onClick={() => alert('Coming soon!')}>
          Download Log
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date Filter
            </label>
            <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              <Filter size={16} className="inline mr-1" />
              Activity Type
            </label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400">
              <option value="all">All Types</option>
              <option value="alphabet">Alphabets</option>
              <option value="phonics">Phonics</option>
              <option value="fruit">Fruits</option>
              <option value="color">Colors</option>
              <option value="number">Numbers</option>
              <option value="animal">Animals</option>
              <option value="shape">Shapes</option>
              <option value="pattern">Patterns</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="primary" className="w-full"
              onClick={() => { setAppliedDate(selectedDate); setAppliedType(filterType); }}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center">
          <BookOpen size={24} className="mx-auto mb-2 text-blue-600" />
          <p className="text-3xl font-bold text-blue-900">{totalActivities}</p>
          <p className="text-sm text-blue-700">Total Activities</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-center">
          <Star size={24} className="mx-auto mb-2 text-green-600" />
          <p className="text-3xl font-bold text-green-900">{avgScore}/5</p>
          <p className="text-sm text-green-700">Average Score</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-3xl font-bold text-yellow-900">{totalStars}</p>
          <p className="text-sm text-yellow-700">Stars Earned</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-3xl font-bold text-purple-900">
            {Object.keys(grouped).length}
          </p>
          <p className="text-sm text-purple-700">Active Days</p>
        </Card>
      </div>

      {/* No data */}
      {groupedDays.length === 0 && (
        <Card className="text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-text/60 font-semibold text-lg">No activities found</p>
          <p className="text-text/40 text-sm mt-1">
            {appliedDate !== 'all' || appliedType !== 'all'
              ? 'Try changing the filters'
              : 'No activities completed yet'}
          </p>
        </Card>
      )}

      {/* Activity Timeline */}
      {groupedDays.map((dayData, dayIndex) => (
        <motion.div key={dayData.date}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.08 }}>
          <Card>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <Calendar size={24} className="text-primary-600" />
              <div>
                <h2 className="text-xl font-bold text-text">{dayData.dateLabel}</h2>
                <p className="text-sm text-text/60">{dayData.date}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-text/60">Activities</p>
                <p className="text-2xl font-bold text-text">{dayData.activities.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              {dayData.activities.map((activity, actIndex) => (
                <motion.div key={activity.id || actIndex}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dayIndex * 0.08 + actIndex * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">

                  {/* Time */}
                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-semibold text-text">
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={28} className="text-primary-600" />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-text text-lg">
                          {activity.activityName || 'Activity'}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold mt-1 ${
                          getTypeColor(activity.activityName)
                        }`}>
                          Activity #{activity.activityId || '—'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(activity.stars)}`}>
                          {'⭐'.repeat(Math.min(activity.stars || 0, 5))}
                        </p>
                        <p className="text-sm text-text/60 mt-1">
                          {activity.stars || 0}/5 · {activity.score || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      ))}

    </div>
  );
};

export default ActivityLog;