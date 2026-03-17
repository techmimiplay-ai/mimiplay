// import React from 'react';
// import { Card } from '../../../components/shared';
// import { TrendingUp, CheckCircle, Clock, Lock } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ProgressTab = () => {
//   const learningJourney = {
//     currentLevel: 'Little Star',
//     currentStars: 245,
//     nextLevel: 'Bright Star',
//     starsNeeded: 300,
//     progress: 82
//   };

//   const skills = [
//     { name: 'Alphabets', level: 'A-E', status: 'completed', progress: 100, color: 'green' },
//     { name: 'Common Fruits', level: 'Basic', status: 'completed', progress: 100, color: 'green' },
//     { name: 'Colors', level: 'In Progress', status: 'in-progress', progress: 70, color: 'blue' },
//     { name: 'Animals', level: 'Locked', status: 'locked', progress: 0, color: 'gray' },
//     { name: 'Numbers', level: 'Locked', status: 'locked', progress: 0, color: 'gray' },
//   ];

//   const weeklyData = [
//     { day: 'Mon', activities: 5 },
//     { day: 'Tue', activities: 3 },
//     { day: 'Wed', activities: 4 },
//     { day: 'Thu', activities: 6 },
//     { day: 'Fri', activities: 3 },
//   ];

//   const maxActivities = Math.max(...weeklyData.map(d => d.activities));

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-4xl font-bold text-text mb-2">Learning Progress 🚀</h1>
//         <p className="text-text/60">Track skills and milestones</p>
//       </div>

//       {/* Learning Journey */}
//       <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <p className="text-white/90 text-sm mb-1">Current Level</p>
//             <h2 className="text-3xl font-bold">{learningJourney.currentLevel} ⭐⭐⭐</h2>
//           </div>
//           <div className="text-right">
//             <p className="text-white/90 text-sm mb-1">Next Level</p>
//             <h3 className="text-xl font-semibold">{learningJourney.nextLevel}</h3>
//           </div>
//         </div>
        
//         <div className="mb-2">
//           <div className="flex items-center justify-between text-sm mb-1">
//             <span>{learningJourney.currentStars} stars</span>
//             <span>{learningJourney.starsNeeded} stars needed</span>
//           </div>
//           <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: `${learningJourney.progress}%` }}
//               transition={{ duration: 1, delay: 0.5 }}
//               className="h-full bg-white rounded-full flex items-center justify-end pr-2"
//             >
//               <span className="text-xs font-bold text-purple-600">{learningJourney.progress}%</span>
//             </motion.div>
//           </div>
//         </div>
        
//         <p className="text-white/90 text-sm">
//           🎉 Just {learningJourney.starsNeeded - learningJourney.currentStars} stars away from {learningJourney.nextLevel}!
//         </p>
//       </Card>

//       {/* Skills Progress */}
//       <Card>
//         <h2 className="text-2xl font-bold text-text mb-4">Skills Mastered</h2>
//         <div className="space-y-4">
//           {skills.map((skill, index) => (
//             <motion.div
//               key={skill.name}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="relative"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-3">
//                   {skill.status === 'completed' && <CheckCircle size={24} className="text-green-600" />}
//                   {skill.status === 'in-progress' && <Clock size={24} className="text-blue-600" />}
//                   {skill.status === 'locked' && <Lock size={24} className="text-gray-400" />}
//                   <div>
//                     <h3 className="font-semibold text-text">{skill.name}</h3>
//                     <p className="text-sm text-text/60">{skill.level}</p>
//                   </div>
//                 </div>
//                 <span className="text-2xl font-bold text-text">{skill.progress}%</span>
//               </div>
              
//               <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={{ width: `${skill.progress}%` }}
//                   transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
//                   className={`h-full rounded-full ${
//                     skill.color === 'green' ? 'bg-green-500' :
//                     skill.color === 'blue' ? 'bg-blue-500' :
//                     'bg-gray-400'
//                   }`}
//                 />
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </Card>

//       {/* Weekly Activity Chart */}
//       <Card>
//         <h2 className="text-2xl font-bold text-text mb-4">This Week's Activity</h2>
//         <div className="flex items-end justify-between gap-4 h-64">
//           {weeklyData.map((day, index) => (
//             <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
//               <motion.div
//                 initial={{ height: 0 }}
//                 animate={{ height: `${(day.activities / maxActivities) * 100}%` }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="w-full bg-gradient-to-t from-primary-400 to-secondary-400 rounded-t-xl min-h-[20px] relative"
//               >
//                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-text">
//                   {day.activities}
//                 </span>
//               </motion.div>
//               <span className="text-sm font-semibold text-text">{day.day}</span>
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-3 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center">
//           <p className="text-sm text-blue-700 mb-1">Speaking</p>
//           <p className="text-4xl font-bold text-blue-900 mb-1">85%</p>
//           <div className="w-full bg-blue-200 rounded-full h-2">
//             <div className="w-[85%] h-full bg-blue-600 rounded-full" />
//           </div>
//         </Card>
//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-center">
//           <p className="text-sm text-green-700 mb-1">Reading</p>
//           <p className="text-4xl font-bold text-green-900 mb-1">90%</p>
//           <div className="w-full bg-green-200 rounded-full h-2">
//             <div className="w-[90%] h-full bg-green-600 rounded-full" />
//           </div>
//         </Card>
//         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center">
//           <p className="text-sm text-purple-700 mb-1">Listening</p>
//           <p className="text-4xl font-bold text-purple-900 mb-1">88%</p>
//           <div className="w-full bg-purple-200 rounded-full h-2">
//             <div className="w-[88%] h-full bg-purple-600 rounded-full" />
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ProgressTab;

// src/components/parent/progress/ProgressTab.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Card } from '../../../components/shared';
import { CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LEVELS = [
  { name: 'Little Star',  min: 0,   max: 49,        emoji: '⭐' },
  { name: 'Bright Star',  min: 50,  max: 99,        emoji: '🌟' },
  { name: 'Super Star',   min: 100, max: 199,       emoji: '💫' },
  { name: 'Rising Star',  min: 200, max: 349,       emoji: '🚀' },
  { name: 'Champion',     min: 350, max: 499,       emoji: '🏆' },
  { name: 'Legend',       min: 500, max: Infinity,  emoji: '👑' },
];

function getLevel(stars)     { return LEVELS.find(l => stars >= l.min && stars <= l.max) || LEVELS[0]; }
function getNextLevel(stars) {
  const i = LEVELS.findIndex(l => stars >= l.min && stars <= l.max);
  return LEVELS[i + 1] || null;
}

const SKILLS = [
  { name: 'Alphabets',     unlocksAt: 0,   color: 'green'  },
  { name: 'Common Fruits', unlocksAt: 0,   color: 'green'  },
  { name: 'Colors',        unlocksAt: 10,  color: 'blue'   },
  { name: 'Animals',       unlocksAt: 30,  color: 'purple' },
  { name: 'Numbers',       unlocksAt: 50,  color: 'orange' },
  { name: 'Phonics',       unlocksAt: 100, color: 'pink'   },
];

const barColor = {
  green: 'bg-green-500', blue: 'bg-blue-500',
  purple: 'bg-purple-500', orange: 'bg-orange-500', pink: 'bg-pink-500'
};

const ProgressTab = ({ selectedChild }) => {

  // ── State ───────────────────────────────────────────────────
  const [starsData, setStarsData] = useState({
    total_stars: 0,
    results: [],
  });
  const [loading, setLoading] = useState(false);

  // ── Fetch jab bhi selectedChild badle ──────────────────────
  useEffect(() => {
    if (!selectedChild?.id) return;
    fetchProgressData(selectedChild.id);
  }, [selectedChild?.id]);

  const fetchProgressData = async (studentId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`
      );
      if (res.data?.status === 'success') {
        setStarsData({
          total_stars: res.data.total_stars,
          results:     res.data.results,
        });
      }
    } catch (err) {
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Calculations ────────────────────────────────────────────
  const totalStars = starsData.total_stars;
  const results    = starsData.results;
  const level      = getLevel(totalStars);
  const nextLevel  = getNextLevel(totalStars);
  const progress   = nextLevel
    ? Math.round(((totalStars - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  // Last 7 days activity count
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0]; // "2026-03-14"
    const count = results.filter(r => r.date === dateStr).length;
    return { day: i === 6 ? 'Today' : days[d.getDay()], activities: count };
  });
  const maxAct = Math.max(...weeklyData.map(d => d.activities), 1);

  const skills = SKILLS.map(s => ({
    ...s,
    unlocked: totalStars >= s.unlocksAt,
    progress: totalStars >= s.unlocksAt
      ? 100
      : Math.min(99, Math.round((totalStars / (s.unlocksAt || 1)) * 100)),
  }));

  // ── No child selected ───────────────────────────────────────
  if (!selectedChild) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3">📈</div>
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
        <p className="text-text/60">Loading progress...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-4xl font-bold text-text mb-2">
          {selectedChild.name}'s Progress 📈
        </h1>
        <p className="text-text/60">Track skills and milestones</p>
      </div>

      {/* Level Journey */}
      <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Current Level</p>
            <h2 className="text-3xl font-bold">{level.emoji} {level.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Next Level</p>
            <h3 className="text-xl font-semibold">
              {nextLevel ? `${nextLevel.emoji} ${nextLevel.name}` : '👑 Max Level!'}
            </h3>
          </div>
        </div>
        <div className="flex justify-between text-sm text-white/80 mb-1">
          <span>{totalStars} ⭐</span>
          <span>{nextLevel ? `${nextLevel.min - totalStars} more to unlock` : 'Legend!'}</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <p className="text-right text-white/80 text-sm mt-1">{progress}%</p>
      </Card>

      {/* Total Stars */}
      <Card className="text-center py-6">
        <motion.div key={totalStars} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          transition={{ type: 'spring' }}>
          <div className="text-6xl mb-2">⭐</div>
          <p className="text-6xl font-bold text-yellow-500">{totalStars}</p>
          <p className="text-text/60 text-lg mt-1">Total Stars Earned</p>
          <p className="text-text/40 text-sm">{results.length} activities completed</p>
        </motion.div>
      </Card>

      {/* Skills Progress */}
      <Card>
        <h2 className="text-2xl font-bold text-text mb-4">Skills Progress</h2>
        <div className="space-y-4">
          {skills.map((skill, i) => (
            <motion.div key={skill.name}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`p-4 rounded-2xl border-2 ${
                skill.unlocked ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {skill.unlocked
                    ? <CheckCircle size={20} className="text-green-500" />
                    : <Lock size={20} className="text-gray-400" />}
                  <div>
                    <h3 className="font-semibold text-text">{skill.name}</h3>
                    <p className="text-xs text-text/50">
                      {skill.unlocked
                        ? 'Unlocked ✅'
                        : `Needs ${skill.unlocksAt} ⭐ (${Math.max(0, skill.unlocksAt - totalStars)} more)`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold">
                  {skill.unlocked ? '100%' : `${skill.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.progress}%` }}
                  transition={{ duration: 0.6, delay: i * 0.07 }}
                  className={`h-full rounded-full ${
                    skill.unlocked ? barColor[skill.color] : 'bg-gray-400'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Weekly Chart */}
      <Card>
        <h2 className="text-2xl font-bold text-text mb-4">This Week's Activity</h2>
        <div className="flex items-end justify-between gap-4 h-48">
          {weeklyData.map((day, i) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.activities / maxAct) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="w-full bg-gradient-to-t from-primary-400 to-secondary-400 rounded-t-xl min-h-[8px] relative"
              >
                {day.activities > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-text">
                    {day.activities}
                  </span>
                )}
              </motion.div>
              <span className="text-xs font-semibold text-text">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default ProgressTab;