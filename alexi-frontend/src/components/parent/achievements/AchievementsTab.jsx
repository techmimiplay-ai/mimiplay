// import React from 'react';
// import { Card } from '../../../components/shared';
// import { Trophy, Star, Award, Lock } from 'lucide-react';
// import { motion } from 'framer-motion';

// const AchievementsTab = () => {
//   const earnedBadges = [
//     { id: 1, icon: '🏅', name: 'Week Star', description: '5 consecutive days', earnedDate: '2 days ago', rarity: 'common' },
//     { id: 2, icon: '⭐', name: '100% Score', description: 'Perfect alphabet test', earnedDate: '3 days ago', rarity: 'rare' },
//     { id: 3, icon: '🎯', name: 'Fast Learner', description: 'Completed 10 activities in one day', earnedDate: '5 days ago', rarity: 'common' },
//     { id: 4, icon: '🔥', name: '5 Day Streak', description: 'Never missed a day', earnedDate: '1 week ago', rarity: 'uncommon' },
//     { id: 5, icon: '🎨', name: 'Color Master', description: 'All colors identified correctly', earnedDate: '1 week ago', rarity: 'rare' },
//     { id: 6, icon: '📚', name: 'Bookworm', description: 'Completed 50 reading activities', earnedDate: '2 weeks ago', rarity: 'epic' },
//     { id: 7, icon: '🌟', name: 'Rising Star', description: 'Earned 100 total stars', earnedDate: '3 weeks ago', rarity: 'common' },
//     { id: 8, icon: '💯', name: 'Perfectionist', description: '10 perfect scores', earnedDate: '1 month ago', rarity: 'rare' },
//   ];

//   const lockedBadges = [
//     { id: 9, icon: '🏆', name: 'Champion', description: 'Earn 500 total stars', requirement: '245/500 stars' },
//     { id: 10, icon: '👑', name: 'Top of Class', description: 'Rank #1 for a week', requirement: 'Currently #2' },
//     { id: 11, icon: '🚀', name: 'Speed Demon', description: 'Complete 20 activities in a day', requirement: 'Best: 10' },
//     { id: 12, icon: '🎓', name: 'Graduate', description: 'Complete all Junior KG modules', requirement: '3/10 modules' },
//   ];

//   const leaderboard = [
//     { rank: 1, name: 'Priya Patel', stars: 420, trend: 'up' },
//     { rank: 2, name: 'Aarav Sharma', stars: 245, trend: 'up', isCurrentUser: true },
//     { rank: 3, name: 'Rohan Kumar', stars: 370, trend: 'down' },
//     { rank: 4, name: 'Sara Ali', stars: 356, trend: 'up' },
//     { rank: 5, name: 'Ananya Singh', stars: 298, trend: 'stable' },
//   ];

//   const getRarityColor = (rarity) => {
//     switch(rarity) {
//       case 'common': return 'from-gray-400 to-gray-600';
//       case 'uncommon': return 'from-green-400 to-green-600';
//       case 'rare': return 'from-blue-400 to-blue-600';
//       case 'epic': return 'from-purple-400 to-purple-600';
//       case 'legendary': return 'from-yellow-400 to-orange-600';
//       default: return 'from-gray-400 to-gray-600';
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-4xl font-bold text-text mb-2">Achievements 🏆</h1>
//         <p className="text-text/60">Badges earned and milestones reached</p>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-4 gap-4">
//         <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-center">
//           <Trophy size={32} className="mx-auto mb-2 text-yellow-600" />
//           <p className="text-3xl font-bold text-yellow-900">{earnedBadges.length}</p>
//           <p className="text-sm text-yellow-700">Badges Earned</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center">
//           <Star size={32} className="mx-auto mb-2 text-purple-600" />
//           <p className="text-3xl font-bold text-purple-900">245</p>
//           <p className="text-sm text-purple-700">Total Stars</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center">
//           <Award size={32} className="mx-auto mb-2 text-blue-600" />
//           <p className="text-3xl font-bold text-blue-900">2</p>
//           <p className="text-sm text-blue-700">Rare Badges</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-center">
//           <div className="text-3xl mb-2">🏅</div>
//           <p className="text-3xl font-bold text-green-900">#2</p>
//           <p className="text-sm text-green-700">Class Rank</p>
//         </Card>
//       </div>

//       {/* Earned Badges */}
//       <Card>
//         <h2 className="text-2xl font-bold text-text mb-4">Badges Earned</h2>
//         <div className="grid grid-cols-4 gap-4">
//           {earnedBadges.map((badge, index) => (
//             <motion.div
//               key={badge.id}
//               initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
//               animate={{ opacity: 1, scale: 1, rotateY: 0 }}
//               transition={{ 
//                 delay: index * 0.1,
//                 duration: 0.5,
//                 type: "spring"
//               }}
//               whileHover={{ scale: 1.05, y: -5 }}
//               className={`relative p-6 rounded-2xl bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white text-center cursor-pointer group`}
//             >
//               <div className="text-6xl mb-3">{badge.icon}</div>
//               <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
//               <p className="text-sm text-white/90 mb-2">{badge.description}</p>
//               <p className="text-xs text-white/70">{badge.earnedDate}</p>
              
//               {/* Rarity badge */}
//               <div className="absolute top-2 right-2 px-2 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-semibold">
//                 {badge.rarity.toUpperCase()}
//               </div>

//               {/* Shine effect */}
//               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
//             </motion.div>
//           ))}
//         </div>
//       </Card>

//       {/* Locked Badges */}
//       <Card className="bg-gray-50">
//         <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
//           <Lock size={24} className="text-gray-600" />
//           Locked Badges
//         </h2>
//         <p className="text-text/60 mb-4">Keep learning to unlock these achievements!</p>
//         <div className="grid grid-cols-4 gap-4">
//           {lockedBadges.map((badge, index) => (
//             <motion.div
//               key={badge.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="relative p-6 rounded-2xl bg-gray-200 border-2 border-gray-300 text-center"
//             >
//               <div className="text-6xl mb-3 grayscale opacity-50">{badge.icon}</div>
//               <h3 className="font-bold text-lg mb-1 text-gray-700">{badge.name}</h3>
//               <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
//               <div className="mt-3 px-3 py-1 bg-gray-300 rounded-lg text-xs font-semibold text-gray-700">
//                 {badge.requirement}
//               </div>
              
//               {/* Lock overlay */}
//               <div className="absolute top-3 right-3">
//                 <Lock size={20} className="text-gray-500" />
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </Card>

//       {/* Class Leaderboard */}
//       <Card>
//         <div className="flex items-center gap-2 mb-4">
//           <Trophy size={28} className="text-yellow-600" />
//           <h2 className="text-2xl font-bold text-text">Class Leaderboard</h2>
//         </div>
//         <p className="text-text/60 mb-4">See how you compare with your classmates</p>
//         <div className="space-y-3">
//           {leaderboard.map((student, index) => (
//             <motion.div
//               key={student.rank}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className={`
//                 flex items-center justify-between p-4 rounded-2xl transition-all
//                 ${student.isCurrentUser 
//                   ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-300' 
//                   : 'bg-gray-50 hover:bg-gray-100'
//                 }
//               `}
//             >
//               <div className="flex items-center gap-4">
//                 <div className={`
//                   w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
//                   ${student.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
//                     student.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
//                     student.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
//                     'bg-gray-200 text-gray-700'
//                   }
//                 `}>
//                   {student.rank}
//                 </div>
//                 <div>
//                   <h3 className={`font-semibold ${student.isCurrentUser ? 'text-primary-700' : 'text-text'}`}>
//                     {student.name}
//                     {student.isCurrentUser && <span className="ml-2 text-sm">(You!)</span>}
//                   </h3>
//                   <p className="text-sm text-text/60">{student.stars} stars</p>
//                 </div>
//               </div>
//               <div className="text-2xl">
//                 {student.trend === 'up' && '📈'}
//                 {student.trend === 'down' && '📉'}
//                 {student.trend === 'stable' && '➡️'}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </Card>

//       {/* Motivation Card */}
//       <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
//         <div className="flex items-center gap-4">
//           <div className="text-6xl">🎯</div>
//           <div>
//             <h3 className="text-2xl font-bold mb-2">Keep Going!</h3>
//             <p className="text-white/90">
//               You're doing amazing! Just 175 more stars to reach Champion status. 
//               Complete your daily activities to earn more badges! 🌟
//             </p>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default AchievementsTab;

// src/components/parent/achievements/AchievementsTab.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Card } from '../../../components/shared';
import { Star, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const ALL_BADGES = [
  { id:1, icon:'🌟', name:'First Star',    description:'Earn your first star',   unlockAt:1,   rarity:'common'    },
  { id:2, icon:'📚', name:'Bookworm',      description:'Complete 3 activities',  unlockAt:5,   rarity:'common'    },
  { id:3, icon:'🏃', name:'Fast Learner',  description:'Earn 15 stars',          unlockAt:15,  rarity:'common'    },
  { id:4, icon:'🔥', name:'On Fire',       description:'Earn 30 stars',          unlockAt:30,  rarity:'uncommon'  },
  { id:5, icon:'🎨', name:'Color Master',  description:'Earn 50 stars',          unlockAt:50,  rarity:'rare'      },
  { id:6, icon:'💯', name:'Perfect Score', description:'Earn 75 stars',          unlockAt:75,  rarity:'rare'      },
  { id:7, icon:'🏆', name:'Champion',      description:'Earn 100 stars',         unlockAt:100, rarity:'epic'      },
  { id:8, icon:'👑', name:'Legend',        description:'Earn 200 stars',         unlockAt:200, rarity:'legendary' },
];

const RARITY_GRADIENT = {
  common:    'from-gray-400 to-gray-600',
  uncommon:  'from-green-400 to-green-600',
  rare:      'from-blue-400 to-blue-600',
  epic:      'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const AchievementsTab = ({ selectedChild }) => {

  // ── State ───────────────────────────────────────────────────
  const [starsData, setStarsData] = useState({
    total_stars: 0,
    results: [],
  });
  const [loading, setLoading] = useState(false);

  // ── Fetch jab bhi selectedChild badle ──────────────────────
  useEffect(() => {
    if (!selectedChild?.id) return;
    fetchAchievementsData(selectedChild.id);
  }, [selectedChild?.id]);

  const fetchAchievementsData = async (studentId) => {
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
      console.error('Achievements fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Calculations ────────────────────────────────────────────
  const totalStars = starsData.total_stars;
  const earned     = ALL_BADGES.filter(b => totalStars >= b.unlockAt);
  const locked     = ALL_BADGES.filter(b => totalStars <  b.unlockAt);
  const nextBadge  = locked[0];

  // Leaderboard — current child live, baaki static
  const leaderboard = [
    { name: selectedChild?.name || 'You', stars: totalStars, isCurrentUser: true  },
    { name: 'Priya Patel',                stars: 42,         isCurrentUser: false },
    { name: 'Rohan Kumar',                stars: 37,         isCurrentUser: false },
    { name: 'Sara Ali',                   stars: 35,         isCurrentUser: false },
    { name: 'Ananya Singh',               stars: 29,         isCurrentUser: false },
  ]
    .sort((a, b) => b.stars - a.stars)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  // ── No child selected ───────────────────────────────────────
  if (!selectedChild) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3">🏆</div>
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
        <p className="text-text/60">Loading achievements...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-4xl font-bold text-text mb-2">
          {selectedChild.name}'s Achievements 🏆
        </h1>
        <p className="text-text/60">Badges earned and goals to unlock</p>
      </div>

      {/* Stars summary */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 border-0 text-white text-center py-6">
        <motion.div key={totalStars} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          transition={{ type: 'spring' }}>
          <Star size={56} className="mx-auto mb-2 fill-white text-white" />
          <p className="text-6xl font-bold">{totalStars}</p>
          <p className="text-white/90 text-xl mt-1">Total Stars</p>
          <p className="text-white/70 text-sm mt-1">
            {earned.length} / {ALL_BADGES.length} badges unlocked
          </p>
        </motion.div>
      </Card>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text mb-4">
            🎖️ Earned Badges ({earned.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earned.map((badge, i) => (
              <motion.div key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, type: 'spring' }}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${RARITY_GRADIENT[badge.rarity]} flex items-center justify-center text-4xl mx-auto mb-3`}>
                    {badge.icon}
                  </div>
                  <h3 className="font-bold text-text text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-text/60 mb-2">{badge.description}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold bg-gradient-to-r ${RARITY_GRADIENT[badge.rarity]} text-white capitalize`}>
                    {badge.rarity}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No badges yet */}
      {earned.length === 0 && (
        <Card className="text-center py-10">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-text/60 font-semibold">No badges yet!</p>
          <p className="text-sm text-text/40 mt-1">
            Complete activities to earn your first badge
          </p>
        </Card>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text mb-4">
            🔒 Locked Badges ({locked.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locked.map((badge, i) => (
              <motion.div key={badge.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <Card className="text-center opacity-60">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-3 relative">
                    <span className="text-4xl blur-sm">{badge.icon}</span>
                    <Lock size={20} className="absolute text-gray-500" />
                  </div>
                  <h3 className="font-bold text-text text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-text/60 mb-2">{badge.description}</p>
                  <p className="text-xs font-semibold text-primary-600">
                    Need {badge.unlockAt} ⭐ ({Math.max(0, badge.unlockAt - totalStars)} more)
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <h2 className="text-2xl font-bold text-text mb-4">🏅 Class Leaderboard</h2>
        <div className="space-y-3">
          {leaderboard.map((student, i) => (
            <motion.div key={student.name}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                student.isCurrentUser
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-100 bg-white'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                  student.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                  student.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'   :
                  student.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
                </div>
                <div>
                  <h3 className={`font-semibold ${student.isCurrentUser ? 'text-primary-700' : 'text-text'}`}>
                    {student.name}
                    {student.isCurrentUser && (
                      <span className="ml-2 text-sm text-primary-400">(You!)</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-text/60">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{student.stars} stars</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Motivation */}
      <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="text-6xl">🚀</div>
          <div>
            <h3 className="text-2xl font-bold mb-1">Keep Going!</h3>
            <p className="text-white/90">
              {totalStars === 0
                ? 'Complete your first activity to earn stars and unlock badges!'
                : nextBadge
                  ? `Only ${nextBadge.unlockAt - totalStars} more stars to unlock "${nextBadge.name}"! ${nextBadge.icon}`
                  : 'You have unlocked all badges! You are a Legend! 👑'}
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default AchievementsTab;