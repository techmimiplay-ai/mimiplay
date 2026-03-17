// import React, { useState } from 'react';
// import { Button, Card, Modal } from '../../../components/shared';
// import { Play, Settings, Plus, BookOpen, Clock, Users } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ActivitiesTab = () => {
//   const [showConfigModal, setShowConfigModal] = useState(false);
//   const [selectedActivity, setSelectedActivity] = useState(null);

//   const activities = [
//     {
//       id: 1,
//       name: 'Alphabet Practice',
//       icon: '🔤',
//       category: 'Alphabets',
//       levels: 'A-Z',
//       avgTime: '15 min',
//       difficulty: 'Easy',
//       studentsCompleted: 156,
//       avgScore: 4.5,
//       description: 'Learn and practice all 26 letters with pronunciation and examples'
//     },
//     {
//       id: 2,
//       name: 'Phonics Basics',
//       icon: '🗣️',
//       category: 'Phonics',
//       levels: 'Basic',
//       avgTime: '12 min',
//       difficulty: 'Medium',
//       studentsCompleted: 128,
//       avgScore: 4.0,
//       description: 'Understanding letter sounds and phonetic patterns'
//     },
//     {
//       id: 3,
//       name: 'Fruits Recognition',
//       icon: '🍎',
//       category: 'Objects',
//       levels: '10 Items',
//       avgTime: '10 min',
//       difficulty: 'Easy',
//       studentsCompleted: 142,
//       avgScore: 4.2,
//       description: 'Identify and name common fruits with visual aids'
//     },
//     {
//       id: 4,
//       name: 'Animal Sounds',
//       icon: '🐮',
//       category: 'Objects',
//       levels: '8 Animals',
//       avgTime: '8 min',
//       difficulty: 'Easy',
//       studentsCompleted: 134,
//       avgScore: 4.6,
//       description: 'Learn animal names and their sounds'
//     },
//     {
//       id: 5,
//       name: 'Colors Matching',
//       icon: '🎨',
//       category: 'Colors',
//       levels: '12 Colors',
//       avgTime: '10 min',
//       difficulty: 'Easy',
//       studentsCompleted: 145,
//       avgScore: 4.8,
//       description: 'Match objects with their colors'
//     },
//     {
//       id: 6,
//       name: 'Number Counting',
//       icon: '🔢',
//       category: 'Numbers',
//       levels: '1-10',
//       avgTime: '12 min',
//       difficulty: 'Easy',
//       studentsCompleted: 138,
//       avgScore: 4.3,
//       description: 'Count objects and recognize numbers 1-10'
//     },
//   ];

//   const handleStartActivity = (activity) => {
//     alert(`Starting activity: ${activity.name}\n\nThis will launch the activity on the Smart TV (Mimi screen).`);
//     // In production: window.open('/student?activity=' + activity.id);
//   };

//   const handleConfigureActivity = (activity) => {
//     setSelectedActivity(activity);
//     setShowConfigModal(true);
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty.toLowerCase()) {
//       case 'easy': return 'bg-green-100 text-green-700';
//       case 'medium': return 'bg-yellow-100 text-yellow-700';
//       case 'hard': return 'bg-red-100 text-red-700';
//       default: return 'bg-gray-100 text-gray-700';
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold text-text mb-2">Learning Activities</h1>
//           <p className="text-text/60">Manage and launch classroom activities</p>
//         </div>
//         <Button variant="primary" icon={Plus}>
//           Create Custom Activity
//         </Button>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-4 gap-4">
//         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
//           <p className="text-sm text-blue-700 mb-1">Total Activities</p>
//           <p className="text-4xl font-bold text-blue-900">{activities.length}</p>
//         </Card>
//         <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//           <p className="text-sm text-green-700 mb-1">Completions</p>
//           <p className="text-4xl font-bold text-green-900">
//             {activities.reduce((sum, a) => sum + a.studentsCompleted, 0)}
//           </p>
//         </Card>
//         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
//           <p className="text-sm text-purple-700 mb-1">Avg Score</p>
//           <p className="text-4xl font-bold text-purple-900">
//             {(activities.reduce((sum, a) => sum + a.avgScore, 0) / activities.length).toFixed(1)}/5
//           </p>
//         </Card>
//         <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//           <p className="text-sm text-yellow-700 mb-1">Avg Duration</p>
//           <p className="text-4xl font-bold text-yellow-900">11m</p>
//         </Card>
//       </div>

//       {/* Activities Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {activities.map((activity, index) => (
//           <motion.div
//             key={activity.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//           >
//             <Card hover className="h-full">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center text-4xl">
//                     {activity.icon}
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-text text-lg">{activity.name}</h3>
//                     <p className="text-sm text-text/60">{activity.category}</p>
//                   </div>
//                 </div>
//               </div>

//               <p className="text-sm text-text/70 mb-4">{activity.description}</p>

//               <div className="space-y-2 mb-4">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-text/60">Levels:</span>
//                   <span className="font-semibold text-text">{activity.levels}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-text/60">Avg Time:</span>
//                   <span className="font-semibold text-text flex items-center gap-1">
//                     <Clock size={14} />
//                     {activity.avgTime}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-text/60">Difficulty:</span>
//                   <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getDifficultyColor(activity.difficulty)}`}>
//                     {activity.difficulty}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
//                 <Users size={16} className="text-text/60" />
//                 <span className="text-sm text-text/70">
//                   <strong>{activity.studentsCompleted}</strong> completions
//                 </span>
//                 <span className="ml-auto text-sm font-semibold text-text">
//                   ⭐ {activity.avgScore}/5
//                 </span>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   variant="primary"
//                   icon={Play}
//                   className="flex-1"
//                   onClick={() => handleStartActivity(activity)}
//                 >
//                   Start
//                 </Button>
//                 <Button
//                   variant="outline"
//                   icon={Settings}
//                   onClick={() => handleConfigureActivity(activity)}
//                 >
//                   Config
//                 </Button>
//               </div>
//             </Card>
//           </motion.div>
//         ))}
//       </div>

//       {/* Configure Activity Modal */}
//       {selectedActivity && (
//         <Modal
//           isOpen={showConfigModal}
//           onClose={() => setShowConfigModal(false)}
//           title={`Configure: ${selectedActivity.name}`}
//           size="md"
//         >
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-semibold text-text mb-2">
//                 Difficulty Level
//               </label>
//               <select className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400">
//                 <option>Easy</option>
//                 <option>Medium</option>
//                 <option>Hard</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-text mb-2">
//                 Time Limit (minutes)
//               </label>
//               <input
//                 type="number"
//                 defaultValue={15}
//                 className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-text mb-2">
//                 Number of Questions
//               </label>
//               <input
//                 type="number"
//                 defaultValue={10}
//                 className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
//               />
//             </div>

//             <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
//               <p className="text-sm text-blue-800">
//                 💡 These settings will apply the next time this activity is launched.
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <Button variant="primary" className="flex-1" onClick={() => {
//                 alert('Settings saved!');
//                 setShowConfigModal(false);
//               }}>
//                 Save Settings
//               </Button>
//               <Button variant="outline" className="flex-1" onClick={() => setShowConfigModal(false)}>
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default ActivitiesTab;






// src/components/teacher/activities/ActivitiesTab.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Button, Card, Modal } from '../../../components/shared';
import { Play, Settings, Plus, Clock, Users, Star, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config';
import { useStars } from '../../../context/StarContext';

import bgImage from '../../../assets/images/mimi/activity_bg.jpg';
import mimiIdleVideo from '../../../assets/images/mimi/mimiidell_nobg.webm';
import mimiWaveVideo from '../../../assets/images/mimi/mimiwavehand_nobg.webm';
import mimiHappyVideo from '../../../assets/images/mimi/mimiwavehand_nobg.webm'; // was .mp4 which had white bg
import mimiNeutralVideo from '../../../assets/images/mimi/mimiidell_nobg.webm';

// ── Emoji map ─────────────────────────────────────────────────────────────────
const WORD_EMOJIS = {
  // Alphabet / Phonics
  Apple: '🍎', Ball: '⚽', Cat: '🐱', Dog: '🐶', Elephant: '🐘', Fish: '🐟',
  Goat: '🐐', Hat: '🎩', Kite: '🪁', Lion: '🦁', Mango: '🥭', Orange: '🍊',
  Rabbit: '🐰', Sun: '☀️', Tiger: '🐯', Zebra: '🦓', Bat: '🦇', Can: '🥫',
  Fan: '🌀', Hen: '🐔', Pen: '✏️', Rat: '🐀', Igloo: '🏔️', Nest: '🪺',
  Owl: '🦉', Umbrella: '☂️', Violin: '🎻', Walrus: '🦭', Xylophone: '🎵',
  Yacht: '⛵', Queen: '👑', Jungle: '🌴', Frog: '🐸', Clap: '👏', Drum: '🥁',
  Flat: '📐', Grin: '😁', Slim: '🪄', Plum: '🍑', Bright: '✨', Crane: '🏗️',
  Dwarf: '🧟', Flask: '⚗️', Grind: '⚙️', Shrub: '🌿', Thrill: '🎢', Whale: '🐋',
  // Fruits
  Banana: '🍌', Grape: '🍇', Strawberry: '🍓', Watermelon: '🍉', Pineapple: '🍍',
  Grapes: '🍇', Lemon: '🍋', Peach: '🍑', Papaya: '🧃', Guava: '🍐', Lychee: '🫐',
  Cherry: '🍒', Kiwi: '🥝', Blueberry: '🫐', Raspberry: '🍓', Apricot: '🍑',
  Pomegranate: '🍎', Custard: '🍮',
  // Animals
  Cow: '🐄', Horse: '🐴', Sheep: '🐑', Duck: '🦆', Bear: '🐻', Fox: '🦊',
  Deer: '🦌', Giraffe: '🦒', Dolphin: '🐬', Penguin: '🐧', Crocodile: '🐊', Cheetah: '🐆',
  // Colors
  Red: '🔴', Blue: '🔵', Green: '🟢', Yellow: '🟡', Purple: '🟣',
  Pink: '🌸', Brown: '🟤', Black: '⚫', White: '⚪', Grey: '🩶', Violet: '💜',
  Maroon: '❤️', Crimson: '🌹', Turquoise: '🩵', Indigo: '🌌', Magenta: '💗',
  Coral: '🪸', Amber: '🍯', Scarlet: '🔺', Olive: '🫒',
  // Numbers
  One: '1️⃣', Two: '2️⃣', Three: '3️⃣', Four: '4️⃣', Five: '5️⃣',
  Six: '6️⃣', Seven: '7️⃣', Eight: '8️⃣', Nine: '9️⃣', Ten: '🔟',
  Eleven: '1️⃣1️⃣', Twelve: '1️⃣2️⃣', Thirteen: '1️⃣3️⃣', Fourteen: '1️⃣4️⃣',
  Fifteen: '1️⃣5️⃣', Sixteen: '1️⃣6️⃣', Seventeen: '1️⃣7️⃣', Eighteen: '1️⃣8️⃣',
  Nineteen: '1️⃣9️⃣', Twenty: '2️⃣0️⃣', Thirty: '3️⃣0️⃣',
  // Body Parts
  Head: '🙂', Eye: '👁️', Ear: '👂', Nose: '👃', Mouth: '👄', Hand: '✋',
  Leg: '🦵', Foot: '🦶', Hair: '💇', Teeth: '🦷', Tongue: '👅', Shoulder: '🫱',
  Arm: '💪', Finger: '☝️', Knee: '🦵', Ankle: '🦶', Chin: '😶', Elbow: '💪',
  Wrist: '⌚', Thumb: '👍', Heel: '🦶', Toe: '🦶', Neck: '🧣',
  // Shapes
  Circle: '⭕', Square: '🔲', Triangle: '🔺', Rectangle: '▬', Star: '⭐',
  Oval: '🥚', Heart: '❤️', Diamond: '💎', Pentagon: '⬠', Hexagon: '⬡',
  Octagon: '🛑', Cylinder: '🪣', Cone: '🍦',
  // Vehicles
  Car: '🚗', Bus: '🚌', Train: '🚆', Bicycle: '🚲', Airplane: '✈️', Truck: '🚛',
  Helicopter: '🚁', Rocket: '🚀', Boat: '⛵', Ship: '🛳️',
};

// ── Activity word sets (difficulty-aware) — used for activities 1-8 ──────────
const ACTIVITY_WORDS = {
  1: {
    easy: ['Apple', 'Ball', 'Cat', 'Dog', 'Hat', 'Rat'],
    medium: ['Elephant', 'Fish', 'Goat', 'Igloo', 'Kite', 'Nest', 'Owl'],
    hard: ['Umbrella', 'Violin', 'Walrus', 'Xylophone', 'Yacht', 'Zebra', 'Queen', 'Jungle'],
  },
  2: {
    easy: ['Bat', 'Can', 'Fan', 'Hen', 'Pen', 'Sun'],
    medium: ['Frog', 'Clap', 'Drum', 'Flat', 'Grin', 'Slim', 'Plum'],
    hard: ['Bright', 'Crane', 'Dwarf', 'Flask', 'Grind', 'Shrub', 'Thrill', 'Whale'],
  },
  3: {
    easy: ['Apple', 'Mango', 'Banana', 'Grapes', 'Lemon', 'Peach'],
    medium: ['Orange', 'Papaya', 'Guava', 'Lychee', 'Cherry', 'Kiwi', 'Plum'],
    hard: ['Strawberry', 'Watermelon', 'Pineapple', 'Blueberry', 'Raspberry', 'Apricot', 'Pomegranate', 'Custard'],
  },
  4: {
    easy: ['Cat', 'Dog', 'Cow', 'Duck', 'Hen', 'Rat'],
    medium: ['Horse', 'Sheep', 'Rabbit', 'Goat', 'Bear', 'Fox', 'Deer'],
    hard: ['Elephant', 'Tiger', 'Lion', 'Giraffe', 'Dolphin', 'Penguin', 'Crocodile', 'Cheetah'],
  },
  5: {
    easy: ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'White'],
    medium: ['Orange', 'Purple', 'Brown', 'Black', 'Grey', 'Violet', 'Maroon'],
    hard: ['Crimson', 'Turquoise', 'Indigo', 'Magenta', 'Coral', 'Amber', 'Scarlet', 'Olive'],
  },
  6: {
    easy: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
    medium: ['Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen'],
    hard: ['Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty', 'Thirty'],
  },
  7: {
    easy: ['Head', 'Eye', 'Ear', 'Nose', 'Mouth', 'Hand', 'Leg', 'Foot'],
    medium: ['Hair', 'Teeth', 'Tongue', 'Shoulder', 'Arm', 'Finger', 'Knee', 'Ankle'],
    hard: ['Chin', 'Elbow', 'Wrist', 'Thumb', 'Heel', 'Toe', 'Neck'],
  },
  8: {
    easy: ['Circle', 'Square', 'Triangle', 'Rectangle'],
    medium: ['Star', 'Oval', 'Heart', 'Diamond'],
    hard: ['Pentagon', 'Hexagon', 'Octagon', 'Cylinder', 'Cone'],
  },
  // Activities 9-12: static FALLBACK only — LLM generates fresh questions each session
  9: {
    easy: ['Dog', 'Cat', 'Cow', 'Lion', 'Tiger', 'Rabbit', 'Duck', 'Bear'],
    medium: ['Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Strawberry', 'Pineapple', 'Watermelon'],
    hard: ['Car', 'Bus', 'Train', 'Bicycle', 'Airplane', 'Truck', 'Helicopter', 'Rocket'],
  },
  10: {
    easy: [
      { display: '🍎🍎', answer: '2', count: 2 },
      { display: '⭐⭐⭐', answer: '3', count: 3 },
      { display: '⚽⚽⚽⚽', answer: '4', count: 4 },
      { display: '🍌🍌🍌🍌🍌', answer: '5', count: 5 },
      { display: '🐶🐶🐶', answer: '3', count: 3 },
      { display: '🍎🍎🍎🍎', answer: '4', count: 4 },
    ],
    medium: [
      { display: '🐶🐶🐶🐶🐶🐶', answer: '6', count: 6 },
      { display: '🐱🐱🐱🐱🐱🐱🐱', answer: '7', count: 7 },
      { display: '🐮🐮🐮🐮🐮🐮🐮🐮', answer: '8', count: 8 },
      { display: '🦁🦁🦁🦁🦁🦁🦁🦁🦁', answer: '9', count: 9 },
      { display: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐', answer: '10', count: 10 },
      { display: '🍎🍎🍎🍎🍎🍎🍎', answer: '7', count: 7 },
    ],
    hard: [
      { display: '🍎🍎🍎 + 🍎🍎', answer: '5', addend1: 3, addend2: 2 },
      { display: '⭐⭐⭐⭐ + ⭐⭐', answer: '6', addend1: 4, addend2: 2 },
      { display: '🐶🐶🐶🐶 + 🐶🐶🐶', answer: '7', addend1: 4, addend2: 3 },
      { display: '🍌🍌🍌 + 🍌🍌🍌🍌', answer: '7', addend1: 3, addend2: 4 },
      { display: '🐱🐱 + 🐱🐱🐱🐱', answer: '6', addend1: 2, addend2: 4 },
      { display: '⭐⭐⭐ + ⭐⭐⭐⭐⭐', answer: '8', addend1: 3, addend2: 5 },
    ],
  },
  11: {
    easy: [
      { pattern: '🔴 → 🔵 → ?', answer: 'Red', hint: 'Red' },
      { pattern: '🔵 → 🔴 → ?', answer: 'Blue', hint: 'Blue' },
      { pattern: '🟢 → 🟡 → ?', answer: 'Green', hint: 'Green' },
      { pattern: '⭕ → 🔺 → ?', answer: 'Circle', hint: 'Circle' },
      { pattern: '⭐ → ⭕ → ?', answer: 'Star', hint: 'Star' },
      { pattern: '🔲 → ⭐ → ?', answer: 'Square', hint: 'Square' },
    ],
    medium: [
      { pattern: '🔴 → 🔵 → 🟢 → ?', answer: 'Red', hint: 'Red' },
      { pattern: '⭕ → 🔺 → ⭐ → ?', answer: 'Circle', hint: 'Circle' },
      { pattern: '1 → 2 → 3 → ?', answer: 'Four', hint: 'Four' },
      { pattern: '2 → 4 → 6 → ?', answer: 'Eight', hint: 'Eight' },
      { pattern: '🟡 → 🟢 → 🔵 → ?', answer: 'Yellow', hint: 'Yellow' },
      { pattern: '5 → 4 → 3 → ?', answer: 'Two', hint: 'Two' },
    ],
    hard: [
      { pattern: '1 → 3 → 5 → 7 → ?', answer: 'Nine', hint: 'Nine' },
      { pattern: '2 → 5 → 8 → 11 → ?', answer: 'Fourteen', hint: 'Fourteen' },
      { pattern: '10 → 8 → 6 → 4 → ?', answer: 'Two', hint: 'Two' },
      { pattern: '🔴⭕ → 🔵🔺 → 🟢⭐ → ?', answer: 'Red', hint: 'Red Circle' },
      { pattern: '3 → 6 → 9 → 12 → ?', answer: 'Fifteen', hint: 'Fifteen' },
      { pattern: '100 → 90 → 80 → 70 → ?', answer: 'Sixty', hint: 'Sixty' },
    ],
  },
  // Activity 12 — built dynamically from all other activities (see buildQuiz12 below)
  12: { easy: [], medium: [], hard: [] },
};

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function buildQuiz12(difficulty) {
  const pickN = (arr, n) => shuffleArray(arr).slice(0, Math.min(n, arr.length));
  const tag = (item, source) => ({ _word: item, _source: source });

  const items = [
    ...pickN(ACTIVITY_WORDS[1][difficulty] || ACTIVITY_WORDS[1].easy, 2).map(w => tag(w, '🔤 Alphabet')),
    ...pickN(ACTIVITY_WORDS[2][difficulty] || ACTIVITY_WORDS[2].easy, 2).map(w => tag(w, '🔊 Phonics')),
    ...pickN(ACTIVITY_WORDS[3][difficulty] || ACTIVITY_WORDS[3].easy, 2).map(w => tag(w, '🍎 Fruits')),
    ...pickN(ACTIVITY_WORDS[4][difficulty] || ACTIVITY_WORDS[4].easy, 2).map(w => tag(w, '🐾 Animals')),
    ...pickN(ACTIVITY_WORDS[5][difficulty] || ACTIVITY_WORDS[5].easy, 2).map(w => tag(w, '🎨 Colors')),
    ...pickN(ACTIVITY_WORDS[6][difficulty] || ACTIVITY_WORDS[6].easy, 2).map(w => tag(w, '🔢 Numbers')),
    ...pickN(ACTIVITY_WORDS[7][difficulty] || ACTIVITY_WORDS[7].easy, 2).map(w => tag(w, '👀 Body Parts')),
    ...pickN(ACTIVITY_WORDS[8][difficulty] || ACTIVITY_WORDS[8].easy, 1).map(w => tag(w, '🔷 Shapes')),
  ];

  return shuffleArray(items);
}

function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate; u.pitch = 1.15;
  window.speechSynthesis.speak(u);
}

function PictureGuessCard({ word, emoji, mimiSaying, phase, listening, transcript }) {
  const displayEmoji = emoji || WORD_EMOJIS[word] || '🖼️';
  return (
    <div className="flex flex-col items-center gap-5 max-w-md">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
        className="w-52 h-52 bg-white/95 rounded-3xl shadow-2xl flex items-center justify-center text-9xl border-4 border-purple-300">
        {displayEmoji}
      </motion.div>
      <div className="bg-white/90 backdrop-blur rounded-3xl px-10 py-5 shadow-xl border-4 border-purple-300 text-center w-full">
        <p className="text-lg text-purple-500 mb-2">{mimiSaying}</p>
        {phase === 'listening' && (
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
            className="flex items-center gap-2 justify-center mt-2 bg-red-50 rounded-full px-5 py-2">
            {listening ? <Mic size={18} className="text-red-500" /> : <MicOff size={18} className="text-gray-400" />}
            <span className="font-bold text-red-600 text-sm">{listening ? 'Say it now! 🎤' : 'Listening…'}</span>
          </motion.div>
        )}
        {transcript && <p className="text-xs text-gray-400 mt-2">You said: "{transcript}"</p>}
      </div>
    </div>
  );
}

function CountingCard({ item, mimiSaying, phase, listening, transcript }) {
  const isAddition = item?.addend1 !== undefined;
  return (
    <div className="flex flex-col items-center gap-5 max-w-md">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-6 border-4 border-purple-300 text-center">
        {isAddition ? (
          <>
            <p className="text-2xl font-black text-purple-700 mb-2">How many in total?</p>
            <div className="text-5xl mb-2">{item.display}</div>
            <p className="text-2xl font-bold text-gray-600">{item.addend1} + {item.addend2} = ?</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-purple-700 mb-2">How many? 🔢</p>
            <div className="text-4xl leading-loose mb-2">{item?.display}</div>
          </>
        )}
      </div>
      <div className="bg-white/90 backdrop-blur rounded-3xl px-10 py-4 shadow-xl border-4 border-purple-300 text-center w-full">
        <p className="text-lg text-purple-500 mb-2">{mimiSaying}</p>
        {phase === 'listening' && (
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
            className="flex items-center gap-2 justify-center bg-red-50 rounded-full px-5 py-2">
            {listening ? <Mic size={18} className="text-red-500" /> : <MicOff size={18} className="text-gray-400" />}
            <span className="font-bold text-red-600 text-sm">{listening ? 'Say the number! 🎤' : 'Listening…'}</span>
          </motion.div>
        )}
        {transcript && <p className="text-xs text-gray-400 mt-2">You said: "{transcript}"</p>}
      </div>
    </div>
  );
}

function PatternCard({ item, mimiSaying, phase, listening, transcript }) {
  return (
    <div className="flex flex-col items-center gap-5 max-w-md">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-6 border-4 border-purple-300 text-center w-full">
        <p className="text-5xl font-black text-gray-800 mb-3">{item?.pattern}</p>
        <p className="text-base text-purple-500">What comes next?</p>
      </div>
      <div className="bg-white/90 backdrop-blur rounded-3xl px-10 py-4 shadow-xl border-4 border-purple-300 text-center w-full">
        <p className="text-lg text-purple-500 mb-2">{mimiSaying}</p>
        {phase === 'listening' && (
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
            className="flex items-center gap-2 justify-center bg-red-50 rounded-full px-5 py-2">
            {listening ? <Mic size={18} className="text-red-500" /> : <MicOff size={18} className="text-gray-400" />}
            <span className="font-bold text-red-600 text-sm">{listening ? 'Say your answer! 🎤' : 'Listening…'}</span>
          </motion.div>
        )}
        {transcript && <p className="text-xs text-gray-400 mt-2">You said: "{transcript}"</p>}
      </div>
    </div>
  );
}

function normalizeQuestions(activityId, questions) {
  if (!questions || questions.length === 0) return null;

  if (activityId === 9) {
    return questions.map(q => ({
      _llmEmoji: q.emoji || '',
      answer: q.answer || 'Cat',
    }));
  }

  if (activityId === 10) {
    return questions.map(q => ({
      display: q.display || '🍎🍎',
      answer: String(q.answer || '2'),
      count: q.count != null ? q.count : null,
      addend1: q.addend1 != null ? q.addend1 : null,
      addend2: q.addend2 != null ? q.addend2 : null,
    }));
  }

  if (activityId === 11) {
    return questions.map(q => ({
      pattern: q.pattern || '🔴 → 🔵 → ?',
      answer: q.answer || 'Red',
      hint: q.hint || q.answer || 'Red',
    }));
  }

  if (activityId === 12) {
    return questions.map(q => {
      if (q.type === 'pattern') {
        return { pattern: q.pattern, answer: q.answer, hint: q.hint || q.answer };
      }
      if (q.type === 'count') {
        return {
          display: q.display,
          answer: String(q.answer),
          count: q.count != null ? q.count : null,
          addend1: q.addend1 != null ? q.addend1 : null,
          addend2: q.addend2 != null ? q.addend2 : null,
        };
      }
      if (q.emoji) return { _llmEmoji: q.emoji, answer: q.answer || q.word || 'Dog' };
      return q.answer || q.word || 'Dog';
    });
  }

  return questions;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────────────────────────────────────
// MimiActivityOverlay
// ─────────────────────────────────────────────────────────────────────────────
function MimiActivityOverlay({ activity, difficulty, onStudentDone, onClose, isParentMode = false }) {
  const rawStatic = ACTIVITY_WORDS[activity.id]?.[difficulty] || ACTIVITY_WORDS[activity.id]?.easy || ['Hello'];
  const staticWords = activity.id === 12
    ? buildQuiz12(difficulty)
    : activity.id >= 9
      ? shuffleArray(rawStatic)
      : rawStatic;

  const [words, setWords] = useState(staticWords);
  const [loadingQuestions, setLoadingQuestions] = useState(activity.id >= 9);
  const total = words.length;

  const [phase, setPhase] = useState('waiting');
  const [studentName, setStudentName] = useState('');
  const [mimiVideo, setMimiVideo] = useState(mimiIdleVideo);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [mimiSaying, setMimiSaying] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [starsEarned, setStarsEarned] = useState(0);
  const [llmFeedback, setLlmFeedback] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [sessionResults, setSessionResults] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const intentionalStopRef = useRef(false);

  const recogRef = useRef(null);
  const correctRef = useRef(0);
  const pollRef = useRef(null);
  const phaseRef = useRef('waiting');
  const seenRef = useRef(new Set());
  const resultTimerRef = useRef(null);
  const sessionEndedRef = useRef(false);
  const isPausedRef = useRef(false);
  const answeredRef = useRef(false);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { correctRef.current = correct; }, [correct]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── Fetch LLM questions for activities 9-12 ──────────────────────────────
  useEffect(() => {
    if (activity.id < 9) return;

    let cancelled = false;
    setLoadingQuestions(true);

    const sessionSeed = Math.random().toString(36).slice(2, 8);
    const count = difficulty === 'hard' ? 8 : 6;

    console.log(`[LLM Questions] Fetching for activity=${activity.id} difficulty=${difficulty} seed=${sessionSeed}`);

    axios.post(API_ENDPOINTS.GENERATE_QUESTIONS, {
      activity_id: activity.id,
      difficulty: difficulty,
      count: count,
      session_seed: sessionSeed,
    })
      .then(res => {
        if (cancelled) return;
        console.log('[LLM Questions] Raw response:', res.data);
        const qs = res.data?.questions;
        const err = res.data?.error;
        if (err) console.warn('[LLM Questions] Backend error:', err);
        if (qs && qs.length > 0) {
          console.log(`[LLM Questions] ✅ Got ${qs.length} LLM questions:`, qs);
          const normalized = normalizeQuestions(activity.id, qs);
          if (normalized && normalized.length > 0) {
            setWords(normalized);
          } else {
            console.warn('[LLM Questions] ⚠️ Normalize returned empty — using shuffled fallback');
          }
        } else {
          console.warn('[LLM Questions] ⚠️ Empty/no questions from LLM — using shuffled fallback. Response:', res.data);
        }
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[LLM Questions] ❌ Network error:', err.message, '— using shuffled fallback');
      })
      .finally(() => {
        if (!cancelled) setLoadingQuestions(false);
      });

    return () => { cancelled = true; };
  }, [activity.id, difficulty]); // eslint-disable-line

  function getWordLabel(item) {
    if (typeof item === 'string') return item;
    if (item?._word) return item._word;
    if (item?._llmEmoji) return item.answer;
    if (item?.answer) return item.answer;
    if (item?.hint) return item.hint;
    return '';
  }

  function getAnswer(item) {
    if (typeof item === 'string') return item;
    if (item?._word) return item._word;
    if (item?.answer) return item.answer;
    return '';
  }

  // ── FACE DETECTION ────────────────────────────────────────────────────────
  // Camera opens → scans for a saved face → stops camera immediately on detection
  // No demo fallback — only real saved faces can start the activity
  // const startCameraPoll = useCallback(() => {
  //   clearInterval(pollRef.current);

  //   // Tell backend to open camera and start scanning
  //   axios.get(API_ENDPOINTS.START_FACE_DETECT).catch(() => {});

  //   pollRef.current = setInterval(async () => {
  //     if (phaseRef.current !== 'waiting') return;
  //     try {
  //       const res  = await axios.get(API_ENDPOINTS.GET_STATUS);
  //       const data = res.data;

  //       if (data.warning === 'too_close') {
  //         setWarningMsg('⚠️ Too close! Please step back.');
  //         setShowWarning(true);
  //         setTimeout(() => setShowWarning(false), 2500);
  //         return;
  //       }

  //       if (data.person) {
  //         const name = data.person.replace(/_/g, ' ').trim();
  //         if (seenRef.current.has(name.toLowerCase())) return; // already did this student

  //         // Stop camera immediately — not needed until next student
  //         clearInterval(pollRef.current);
  //         pollRef.current = null;
  //         axios.get(API_ENDPOINTS.STOP_FACE_DETECT).catch(() => {});

  //         setStudentName(name);
  //         setMimiVideo(mimiWaveVideo);
  //         setPhase('intro');
  //       }
  //     } catch {}
  //   }, 300);
  // }, []); // eslint-disable-line

  const startCameraPoll = useCallback((openCamera = true) => {
    clearInterval(pollRef.current);

    if (openCamera) {
      axios.get(API_ENDPOINTS.START_FACE_DETECT).catch(() => { });
    }

    pollRef.current = setInterval(async () => {
      if (phaseRef.current !== 'waiting') return;
      try {
        const res = await axios.get(API_ENDPOINTS.GET_STATUS);
        const data = res.data;

        if (data.warning === 'too_close') {
          setWarningMsg('⚠️ Too close! Please step back.');
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 2500);
          return;
        }

        if (data.person) {
          const name = data.person.replace(/_/g, ' ').trim();
          if (seenRef.current.has(name.toLowerCase())) return;

          clearInterval(pollRef.current);
          pollRef.current = null;
          axios.get(API_ENDPOINTS.STOP_FACE_DETECT).catch(() => { });

          setStudentName(name);
          setMimiVideo(mimiWaveVideo);
          setPhase('intro');
        }
      } catch { }
    }, 300);
  }, []); // eslint-disable-line

  // On mount: open camera (no demo fallback — waits for a real saved face)
  // useEffect(() => {
  //   intentionalStopRef.current = false;
  //   startCameraPoll(true);

  //   return () => {
  //     clearInterval(pollRef.current);
  //     // Only stop the camera if this is a real unmount (not StrictMode remount)
  //     // We use a small delay so StrictMode's immediate remount can restart it
  //     setTimeout(() => {
  //       if (!intentionalStopRef.current) return; // component remounted, don't stop
  //       axios.get(API_ENDPOINTS.STOP_FACE_DETECT).catch(() => { });
  //     }, 100);
  //   };
  // }, []); // eslint-disable-line


  useEffect(() => {
    intentionalStopRef.current = false;

    if (isParentMode) {
      // ✅ Parent mode — camera scan karo lekin SIRF ek baar
      // Student detect hone ke baad camera band ho jayegi
      // aur activity shuru ho jayegi — no next student
      startCameraPoll(true);
    } else {
      // Teacher mode — camera scan
      startCameraPoll(true);
    }

    return () => {
      clearInterval(pollRef.current);
      setTimeout(() => {
        if (!intentionalStopRef.current) return;
        axios.get(API_ENDPOINTS.STOP_FACE_DETECT).catch(() => { });
      }, 100);
    };
  }, []); // eslint-disable-line


  // After each student: reset and open camera again for next student
  const resetForNextStudent = useCallback(() => {
    setCurrent(0);
    setCorrect(0);
    correctRef.current = 0;
    setTranscript('');
    setLlmFeedback('');
    setIsCorrect(null);
    setStarsEarned(0);
    setStudentName('');
    setMimiVideo(mimiIdleVideo);
    answeredRef.current = false;
    setPhase('waiting');

    // ✅ Parent mode mein next student camera nahi khulna
    if (!isParentMode) {
      startCameraPoll();
    }
  }, [startCameraPoll, isParentMode]);

  useEffect(() => {
    // Parent mode mein between_students phase aana hi nahi chahiye
    if (isParentMode) return;
    if (phase !== 'between_students') return;
    setCountdown(5);
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(tick); resetForNextStudent(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [phase, isParentMode]); // eslint-disable-line

  useEffect(() => {
    if (phase === 'waiting' || phase === 'between_students') { setMimiVideo(mimiIdleVideo); return; }
    if (phase === 'done') {
      setMimiVideo(starsEarned >= 4 ? mimiHappyVideo : mimiNeutralVideo);
      return;
    }
    setMimiVideo(mimiWaveVideo);
  }, [phase, starsEarned]);

  useEffect(() => {
    if (phase !== 'intro') return;
    const msg = `Hi ${studentName}! Let's start ${activity.name}!`;
    setMimiSaying(msg); speak(msg);
    const t = setTimeout(() => setPhase('asking'), 3000);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    if (phase !== 'asking') return;
    if (isPausedRef.current) return;

    answeredRef.current = false;

    const item = words[current];
    let msg = '';

    if (activity.id === 9) {
      msg = `Look carefully… what do you see?`;
    } else if (activity.id === 10) {
      if (item?.addend1 !== undefined) {
        msg = `Count them all and tell me the total!`;
      } else {
        msg = `Count the items and tell me how many!`;
      }
    } else if (activity.id === 11) {
      msg = `What comes next in the pattern?`;
    } else {
      const label = getWordLabel(item);
      msg = `Can you say… ${label}?`;
    }

    setMimiSaying(msg); speak(msg, 0.8);
    const t = setTimeout(() => setPhase('listening'), 2200);
    return () => clearTimeout(t);
  }, [phase, current]); // eslint-disable-line

  useEffect(() => {
    if (phase !== 'listening') return;
    if (isPausedRef.current) return;

    setMimiSaying('I am listening… 👂');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const item = words[current];
    const answer = getAnswer(item);

    if (!SR) {
      setMimiSaying('🎤 Microphone not supported on this browser');
      const t = setTimeout(() => {
        if (!answeredRef.current) sendToLLM(answer, '');
      }, 5000);
      return () => clearTimeout(t);
    }

    const rec = new SR();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setListening(true);

    rec.onresult = (e) => {
      const s = e.results[0][0].transcript.trim();
      setTranscript(s);
      setListening(false);
      rec.onend = null;
      rec.onerror = null;
      if (!answeredRef.current) {
        answeredRef.current = true;
        sendToLLM(answer, s);
      }
    };

    rec.onend = () => {
      setListening(false);
      if (!answeredRef.current) {
        answeredRef.current = true;
        sendToLLM(answer, '');
      }
    };

    rec.onerror = () => {
      setListening(false);
      if (!answeredRef.current) {
        answeredRef.current = true;
        sendToLLM(answer, '');
      }
    };

    try { rec.start(); } catch (e) { console.warn('SR start error:', e); }
    recogRef.current = rec;

    const t = setTimeout(() => {
      try { rec.stop(); } catch { }
      if (!answeredRef.current) {
        answeredRef.current = true;
        sendToLLM(answer, '');
      }
    }, 7000);

    return () => {
      clearTimeout(t);
      try { rec.stop(); } catch { }
    };
  }, [phase, current]); // eslint-disable-line

  async function sendToLLM(word, childSaid) {
    setPhase('checking');
    setMimiSaying('Mimi is thinking… 🧠');

    const heard = (childSaid || '').trim();
    if (!heard) {
      const msg = `Oops! Nothing heard. The answer was ${word}! Try next time! 💪`;
      setLlmFeedback(msg);
      handleResult(false, msg);
      return;
    }

    // LOCAL CHECK FIRST — if it passes, mark correct immediately without calling LLM
    // This prevents the LLM from ever overriding a clearly correct answer
    if (checkAnswerLocally(word, heard)) {
      const msg = `Wonderful! ${word} is correct! 🌟`;
      setLlmFeedback(msg);
      handleResult(true, msg);
      return;
    }

    // Local check failed — send to LLM to handle fuzzy pronunciation cases
    try {
      const res = await axios.post(API_ENDPOINTS.ACTIVITY_CHECK, {
        word,
        child_said: heard,
        activity_name: activity.name,
        student_name: studentName,
      });
      const r = res.data?.result;
      // Use LLM result, but run local check one final time as safety net
      const ok = (r?.correct === true) || checkAnswerLocally(word, heard);
      const msg = ok
        ? (r?.feedback ?? `Wonderful! ${word} is correct! 🌟`)
        : (r?.feedback ?? `Never mind! The answer was ${word}! Keep trying! 💪`);
      setLlmFeedback(msg);
      handleResult(ok, msg);
    } catch {
      const ok = checkAnswerLocally(word, heard);
      const msg = ok
        ? `Wonderful! ${word} is correct! 🌟`
        : `Never mind! The answer was ${word}! Keep trying! 💪`;
      setLlmFeedback(msg);
      handleResult(ok, msg);
    }
  }

  function checkAnswerLocally(word, childSaid) {
    // Strip trailing punctuation speech recognition adds (e.g. "Apple." -> "Apple")
    const heard = (childSaid || '').trim().replace(/[.!?,;]+$/, '').toLowerCase();
    if (!heard) return false;
    const expected = word.toLowerCase();

    // Original logic: substring match in either direction
    if (heard.includes(expected) || expected.includes(heard)) return true;

    // Extra: number word <-> digit  (e.g. "three" == "3", "five" == "5")
    const NUM_WORDS = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
      'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15',
      'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19', 'twenty': '20',
      'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60',
    };
    const wordForExpected = Object.keys(NUM_WORDS).find(k => NUM_WORDS[k] === expected);
    if (wordForExpected && heard.includes(wordForExpected)) return true;
    if (NUM_WORDS[expected] && heard.includes(NUM_WORDS[expected])) return true;

    return false;
  }

  function handleResult(ok, feedback) {
    const nc = correctRef.current + (ok ? 1 : 0);
    if (ok) { setCorrect(nc); correctRef.current = nc; }
    setIsCorrect(ok);
    setMimiSaying(feedback);
    speak(feedback);
    setPhase('result');
    clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      if (sessionEndedRef.current) return;
      if (current + 1 < total) {
        setCurrent(c => c + 1);
        setIsCorrect(null);
        setTranscript('');
        setLlmFeedback('');
        setPhase('asking');
      } else {
        finishStudent(nc);
      }
    }, 3500);
  }

  function finishStudent(fc, isEarly = false, skipTransition = false) {
    const attempted = isEarly ? Math.max(current, 1) : total;
    const score = Math.round((fc / attempted) * 100);
    const groupSize = Math.ceil(total / 5);
    const earned = fc === 0 ? 0 : fc === total ? 5 : Math.min(5, Math.ceil(fc / groupSize));

    setStarsEarned(earned);
    setPhase('done');

    const msg = earned === 0
      ? `Good try ${studentName}! Keep practicing! 💪`
      : `Well done ${studentName}! You earned ${earned} star${earned !== 1 ? 's' : ''}! 🎉`;

    setMimiSaying(msg);
    if (!skipTransition) speak(msg);

    seenRef.current.add(studentName.toLowerCase());
    onStudentDone({ stars: earned, score, correct: fc, total: isEarly ? current : total, studentName });
    setSessionResults(prev => [...prev, {
      name: studentName, stars: earned, score,
      correct: fc, total: isEarly ? current : total
    }]);

    // ✅ Parent mode mein next student scan nahi karo
    if (!isEarly && !skipTransition) {
      if (isParentMode) {
        // Parent mode — sirf sessionEnded screen dikhao
        setTimeout(() => {
          sessionEndedRef.current = true
          setSessionEnded(true)
        }, 4500)
      } else {
        // Teacher mode — next student ke liye camera scan
        setTimeout(() => setPhase('between_students'), 4500)
      }
    }
  }

  function handlePause() {
    if (isPausedRef.current) return;
    try { recogRef.current?.stop(); } catch { }
    window.speechSynthesis?.cancel();
    clearTimeout(resultTimerRef.current);
    isPausedRef.current = true;
    setIsPaused(true);
    setListening(false);
    setMimiSaying('⏸️ Activity paused');
    setMimiVideo(mimiIdleVideo);
  }

  function handleResume() {
    isPausedRef.current = false;
    setIsPaused(false);
    setMimiVideo(mimiWaveVideo);
    setPhase('idle_resume');
    setTimeout(() => setPhase('asking'), 50);
  }

  function handleEndClick() {
    try { recogRef.current?.stop(); } catch { }
    window.speechSynthesis?.cancel();
    clearTimeout(resultTimerRef.current);
    clearInterval(pollRef.current);
    isPausedRef.current = true;
    setIsPaused(true);
    setListening(false);
    setMimiVideo(mimiIdleVideo);
    setMimiSaying('⏸️ Activity paused');
    setShowEndConfirm(true);
  }

  function handleEndSession() {
    setShowEndConfirm(false);
    sessionEndedRef.current = true;
    isPausedRef.current = false;
    clearInterval(pollRef.current);
    clearTimeout(resultTimerRef.current);
    axios.get(API_ENDPOINTS.STOP_FACE_DETECT).catch(() => { });
    if (studentName) speak(`Well done ${studentName}!`);
    if (studentName && !['waiting', 'between_students', 'done'].includes(phaseRef.current)) {
      finishStudent(correctRef.current, true, true);
    }
    setSessionEnded(true);
  }

  function handleCancelEnd() {
    setShowEndConfirm(false);
    handleResume();
  }

  const currentItem = words[Math.min(current, total - 1)];
  const word = getWordLabel(currentItem);
  const emoji = currentItem?._llmEmoji || WORD_EMOJIS[word] || '📖';
  const progress = (phase === 'waiting' || phase === 'between_students') ? 0
    : ((current + (phase === 'done' ? 1 : 0)) / total) * 100;

  function renderWordCard() {
    if (activity.id === 9) {
      return (
        <PictureGuessCard
          word={word}
          emoji={currentItem?._llmEmoji || WORD_EMOJIS[word] || '🖼️'}
          mimiSaying={mimiSaying}
          phase={phase}
          listening={listening}
          transcript={transcript}
        />
      );
    }
    if (activity.id === 10) {
      return <CountingCard item={currentItem} mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />;
    }
    if (activity.id === 11) {
      return <PatternCard item={currentItem} mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />;
    }
    if (activity.id === 12) {
      const sourceBadge = currentItem?._source
        ? <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-bold rounded-full mb-2 self-center">{currentItem._source}</span>
        : null;

      if (currentItem?.pattern) {
        return (
          <div className="flex flex-col items-center gap-0 max-w-md w-full">
            {sourceBadge}
            <PatternCard item={currentItem} mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
          </div>
        );
      }
      if (currentItem?.display) {
        return (
          <div className="flex flex-col items-center gap-0 max-w-md w-full">
            {sourceBadge}
            <CountingCard item={currentItem} mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
          </div>
        );
      }
      if (currentItem?._llmEmoji) {
        return (
          <div className="flex flex-col items-center gap-0 max-w-md w-full">
            {sourceBadge}
            <PictureGuessCard word={word} emoji={currentItem._llmEmoji} mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
          </div>
        );
      }
      if (currentItem?._isPicture) {
        return (
          <div className="flex flex-col items-center gap-0 max-w-md w-full">
            {sourceBadge}
            <PictureGuessCard word={word} emoji={currentItem._emoji || WORD_EMOJIS[word] || '🖼️'} mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
          </div>
        );
      }
      if (currentItem?._word) {
        const wEmoji = WORD_EMOJIS[currentItem._word] || '📖';
        return (
          <motion.div key={`word-${current}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
            className="flex flex-col items-center gap-3 max-w-md w-full">
            {sourceBadge}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-44 h-44 bg-white/95 rounded-3xl shadow-2xl flex items-center justify-center text-8xl border-4 border-purple-300">
              {wEmoji}
            </motion.div>
            <div className="bg-white/90 backdrop-blur rounded-3xl px-10 py-5 shadow-xl border-4 border-purple-300 text-center w-full">
              <h2 className="text-5xl font-black text-purple-700 mb-2">{currentItem._word}</h2>
              <p className="text-lg text-purple-500 mb-2">{mimiSaying}</p>
              {phase === 'listening' && (
                <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
                  className="flex items-center gap-2 justify-center mt-2 bg-red-50 rounded-full px-5 py-2">
                  {listening ? <Mic size={18} className="text-red-500" /> : <MicOff size={18} className="text-gray-400" />}
                  <span className="font-bold text-red-600 text-sm">{listening ? 'Say it now! 🎤' : 'Listening…'}</span>
                </motion.div>
              )}
              {transcript && <p className="text-xs text-gray-400 mt-2">You said: "{transcript}"</p>}
            </div>
            <div className="text-white/80 font-semibold text-sm">{current + 1} / {total}</div>
          </motion.div>
        );
      }
    }
    return (
      <motion.div key={`word-${current}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex flex-col items-center gap-5 max-w-md">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="w-44 h-44 bg-white/95 rounded-3xl shadow-2xl flex items-center justify-center text-8xl border-4 border-purple-300">
          {emoji}
        </motion.div>
        <div className="bg-white/90 backdrop-blur rounded-3xl px-10 py-5 shadow-xl border-4 border-purple-300 text-center w-full">
          <h2 className="text-5xl font-black text-purple-700 mb-2">{word}</h2>
          <p className="text-lg text-purple-500 mb-2">{mimiSaying}</p>
          {phase === 'listening' && (
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
              className="flex items-center gap-2 justify-center mt-2 bg-red-50 rounded-full px-5 py-2">
              {listening ? <Mic size={18} className="text-red-500" /> : <MicOff size={18} className="text-gray-400" />}
              <span className="font-bold text-red-600 text-sm">{listening ? 'Say it now! 🎤' : 'Listening…'}</span>
            </motion.div>
          )}
          {transcript && <p className="text-xs text-gray-400 mt-2">You said: "{transcript}"</p>}
        </div>
        <div className="text-white/80 font-semibold text-sm">{current + 1} / {total}</div>
      </motion.div>
    );
  }

  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      if (sessionEnded || ['waiting', 'between_students', 'done'].includes(phase)) return;
      if (isPaused) handleResume(); else handlePause();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPaused, phase, sessionEnded]); // eslint-disable-line

  if (loadingQuestions) {
    return (
      <div className="fixed inset-0 z-50 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${bgImage})` }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 backdrop-blur rounded-3xl px-12 py-10 shadow-2xl border-4 border-purple-300 text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="text-7xl mb-4 inline-block"
          >🧠</motion.div>
          <h2 className="text-3xl font-black text-purple-700 mb-2">Mimi is preparing…</h2>
          <p className="text-purple-500 text-lg mb-1">Creating fresh <strong>{DIFFICULTY_LABELS[difficulty]}</strong> questions!</p>
          <p className="text-gray-400 text-sm mb-4">{activity.name}</p>
          <div className="flex justify-center gap-2 mt-2">
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 bg-purple-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>

      {/* Difficulty badge */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-2 items-end">
        <span className={`px-4 py-2 rounded-full text-sm font-black backdrop-blur border-2 ${difficulty === 'easy' ? 'bg-green-400/80 text-white border-green-600' :
          difficulty === 'medium' ? 'bg-yellow-400/80 text-white border-yellow-600' :
            'bg-red-400/80 text-white border-red-600'
          }`}>
          {DIFFICULTY_LABELS[difficulty]}
        </span>
      </div>

      {/* End confirm dialog */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/50 flex items-center justify-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl px-10 py-8 shadow-2xl border-4 border-red-300 text-center max-w-sm mx-4">
              <div className="text-5xl mb-3">⚠️</div>
              <h2 className="text-2xl font-black text-red-600 mb-2">End Activity?</h2>
              <p className="text-gray-500 mb-6 text-sm">Current progress will be saved and stars awarded for all students done so far.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleEndSession}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg transition-all">
                  Yes, End
                </button>
                <button onClick={handleCancelEnd}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-black rounded-2xl transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Ended — results screen */}
      <AnimatePresence>
        {sessionEnded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl px-10 py-8 shadow-2xl border-4 border-purple-300 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🏆</div>
                <h2 className="text-3xl font-black text-purple-700">Activity Complete!</h2>
                <p className="text-gray-400 text-sm mt-1">{activity.name} · {DIFFICULTY_LABELS[difficulty]}</p>
              </div>
              {sessionResults.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No students completed any questions.</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {sessionResults.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-purple-500">#{i + 1}</span>
                        <div>
                          <p className="font-bold text-gray-800">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.correct}/{r.total} correct · {r.score}%</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={20} className={j < r.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200 text-center">
                <p className="text-blue-700 text-sm font-semibold">⭐ Stars saved to Students tab &amp; Parent portal</p>
              </div>
              <button onClick={() => { clearInterval(pollRef.current); onClose(); }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {phase !== 'waiting' && phase !== 'between_students' && (
        <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 z-40">
          <motion.div className="h-full bg-white rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      )}

      {/* Too-close warning */}
      <AnimatePresence>
        {showWarning && (
          <motion.div initial={{ opacity: 0, scale: 0.8, y: -50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-red-500 text-white px-8 py-4 rounded-3xl border-4 border-red-700 shadow-2xl">
              <p className="text-2xl font-black text-center">{warningMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student name banner */}
      <AnimatePresence>
        {studentName && phase !== 'waiting' && phase !== 'between_students' && (
          <motion.div initial={{ opacity: 0, y: -30, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-white/95 backdrop-blur-lg px-10 py-4 rounded-3xl border-4 border-purple-400 shadow-2xl">
              <h2 className="text-3xl font-black text-purple-700 text-center">Hi {studentName}! 👋</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session scoreboard */}
      {sessionResults.length > 0 && phase !== 'between_students' && (
        <div className="absolute top-6 left-6 z-40 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border-2 border-purple-200 min-w-[220px]">
          <p className="text-sm font-black text-purple-700 mb-2">📊 Session Scoreboard</p>
          {sessionResults.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-1 border-b border-purple-100 last:border-0">
              <span className="text-sm font-semibold text-gray-700 truncate max-w-[110px]">{r.name}</span>
              <div className="flex items-center gap-1 shrink-0">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={12} className={j < r.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
                <span className="text-xs text-gray-500 ml-1">{r.score}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main content area */}
      <div className="absolute inset-0 flex flex-col justify-center z-20 pl-12 pr-[55%]">
        <AnimatePresence mode="wait">

          {phase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white/90 backdrop-blur rounded-3xl px-12 py-8 shadow-2xl border-4 border-purple-300 text-center">
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl mb-3">📷</motion.div>
                <h2 className="text-3xl font-black text-purple-700 mb-2">
                  {sessionResults.length === 0 ? 'Who is first?' : 'Next student, please step up!'}
                </h2>
                <p className="text-lg text-purple-500">Camera is scanning — stand in front of the screen</p>
                <p className="text-sm text-gray-400 mt-2">Activity: {activity.name} · {DIFFICULTY_LABELS[difficulty]}</p>
                {sessionResults.length > 0 && (
                  <p className="text-sm text-green-600 font-semibold mt-2">✅ {sessionResults.length} student{sessionResults.length > 1 ? 's' : ''} done so far</p>
                )}
              </div>
            </motion.div>
          )}

          {phase === 'between_students' && (
            <motion.div key="between" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white/95 backdrop-blur rounded-3xl px-10 py-8 shadow-2xl border-4 border-purple-300 max-w-lg w-full">
              <h2 className="text-3xl font-black text-purple-700 text-center mb-4">🏆 Activity Results So Far</h2>
              <div className="space-y-2 mb-6">
                {sessionResults.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-purple-600">#{i + 1}</span>
                      <span className="font-bold text-gray-800">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={16} className={j < r.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-600">{r.correct}/{r.total}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-purple-600 font-semibold mb-1">Next student in…</p>
                <motion.div key={countdown} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-6xl font-black text-purple-700">{countdown}</motion.div>
              </div>
            </motion.div>
          )}

          {phase === 'intro' && (
            <motion.div key="intro" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white/90 backdrop-blur rounded-3xl px-12 py-8 shadow-2xl border-4 border-purple-300 text-center max-w-lg">
              <div className="text-6xl mb-3">🌟</div>
              <h2 className="text-4xl font-black text-purple-700 mb-2">{activity.name}</h2>
              <p className="text-xl text-purple-500">{mimiSaying}</p>
            </motion.div>
          )}

          {(phase === 'asking' || phase === 'listening') && (
            <motion.div key={`word-${current}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              {renderWordCard()}
            </motion.div>
          )}

          {phase === 'checking' && (
            <motion.div key="checking" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white/90 backdrop-blur rounded-3xl px-12 py-8 shadow-2xl border-4 border-purple-300 text-center max-w-md w-full">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl mb-3 inline-block">🧠</motion.div>
              <h2 className="text-3xl font-black text-purple-700">Mimi AI is thinking…</h2>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white/90 backdrop-blur rounded-3xl px-10 py-7 shadow-2xl border-4 border-purple-300 text-center max-w-md w-full">
              <div className="text-6xl mb-2">{isCorrect ? '🎉' : '💪'}</div>
              <h2 className={`text-4xl font-black mb-3 ${isCorrect ? 'text-green-600' : 'text-orange-500'}`}>
                {isCorrect ? 'That is Correct!' : 'Keep Trying!'}
              </h2>
              <div className="bg-purple-50 rounded-2xl p-4 mb-2 border border-purple-200">
                <p className="text-purple-700 text-lg font-medium">{llmFeedback}</p>
              </div>
              {transcript && <p className="text-xs text-gray-400">Said: "{transcript}" · Correct: "{word}"</p>}
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white/90 backdrop-blur rounded-3xl px-12 py-8 shadow-2xl border-4 border-yellow-300 text-center max-w-md w-full">
              <div className="text-6xl mb-2">🏆</div>
              <h2 className="text-4xl font-black text-yellow-600 mb-2">{correct}/{total} Correct!</h2>
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.1, type: 'spring' }}>
                    <Star size={38} className={i < starsEarned ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  </motion.div>
                ))}
              </div>
              <p className="text-xl font-bold text-purple-700 mb-1">{starsEarned} Stars for {studentName}!</p>
              <p className="text-purple-500 text-sm">Next student coming up…</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom control bar */}
      {!sessionEnded && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
          {studentName && !['waiting', 'between_students', 'done'].includes(phase) && (
            isPaused ? (
              <motion.button onClick={handleResume} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-black text-lg rounded-2xl shadow-2xl border-4 border-green-700 transition-colors">
                ▶ Resume <span className="text-xs font-medium opacity-70 ml-1">[Space]</span>
              </motion.button>
            ) : (
              <motion.button onClick={handlePause} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-white font-black text-lg rounded-2xl shadow-2xl border-4 border-yellow-600 transition-colors">
                ⏸ Pause <span className="text-xs font-medium opacity-70 ml-1">[Space]</span>
              </motion.button>
            )
          )}
          <motion.button onClick={handleEndClick} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-2xl shadow-2xl border-4 border-red-700 transition-colors">
            ⏹ End Session
          </motion.button>
        </div>
      )}

      {/* Mimi video */}
      <div className="absolute bottom-0 right-[8%] z-30 pointer-events-none">
        <motion.div key={mimiVideo} initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="w-[560px] h-[560px]" style={{ background: 'transparent', backgroundColor: 'transparent' }}>
          <video key={mimiVideo} src={mimiVideo} autoPlay loop muted playsInline className="w-full h-full object-contain"
            style={{ background: 'transparent', backgroundColor: 'transparent' }} />
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ActivitiesTab
// ─────────────────────────────────────────────────────────────────────────────
const ActivitiesTab = ({ isParentMode = false }) => {
  const { addActivityResult } = useStars();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [runningActivity, setRunningActivity] = useState(null);
  const [runningDifficulty, setRunningDifficulty] = useState('easy');
  const [lastResult, setLastResult] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [activityDifficulty, setActivityDifficulty] = useState({});

  const activities = [
    { id: 1, name: 'Alphabet Practice', icon: '🔤', category: 'Alphabets', avgTime: '15 min', difficulty: 'Easy→Hard', studentsCompleted: 156, avgScore: 4.5, description: 'Learn and practice letters with pronunciation and examples' },
    { id: 2, name: 'Phonics Basics', icon: '🔊', category: 'Phonics', avgTime: '12 min', difficulty: 'Easy→Hard', studentsCompleted: 128, avgScore: 4.0, description: 'Understanding letter sounds and phonetic patterns' },
    { id: 3, name: 'Fruits Recognition', icon: '🍎', category: 'Objects', avgTime: '10 min', difficulty: 'Easy→Hard', studentsCompleted: 142, avgScore: 4.2, description: 'Identify and name common fruits with visual aids' },
    { id: 4, name: 'Animal Names', icon: '🐾', category: 'Objects', avgTime: '8 min', difficulty: 'Easy→Hard', studentsCompleted: 134, avgScore: 4.6, description: 'Learn animal names and their sounds' },
    { id: 5, name: 'Colors Matching', icon: '🎨', category: 'Colors', avgTime: '10 min', difficulty: 'Easy→Hard', studentsCompleted: 145, avgScore: 4.8, description: 'Match objects with their colors' },
    { id: 6, name: 'Number Counting', icon: '🔢', category: 'Numbers', avgTime: '12 min', difficulty: 'Easy→Hard', studentsCompleted: 138, avgScore: 4.3, description: 'Count objects and recognize numbers 1-10 and beyond' },
    { id: 7, name: 'Body Parts', icon: '👀', category: 'Body', avgTime: '10 min', difficulty: 'Easy→Hard', studentsCompleted: 0, avgScore: 0, description: 'Learn body part names from head to toe' },
    { id: 8, name: 'Shapes', icon: '🔷', category: 'Shapes', avgTime: '8 min', difficulty: 'Easy→Hard', studentsCompleted: 0, avgScore: 0, description: 'Identify and name basic to complex shapes' },
    { id: 9, name: 'Picture Guess', icon: '🖼️', category: 'Guess', avgTime: '10 min', difficulty: 'Easy→Hard', studentsCompleted: 0, avgScore: 0, description: 'Big emoji shown — child guesses the name. Fresh AI questions every session!' },
    { id: 10, name: 'Counting Game', icon: '🔢', category: 'Numbers', avgTime: '10 min', difficulty: 'Easy→Hard', studentsCompleted: 0, avgScore: 0, description: 'Count emoji items on screen — harder levels include addition. AI-powered!' },
    { id: 11, name: 'Pattern Fun', icon: '🔴', category: 'Patterns', avgTime: '12 min', difficulty: 'Easy→Hard', studentsCompleted: 0, avgScore: 0, description: 'Complete AB, ABC, skip-count patterns. Fresh AI questions every session!' },
    { id: 12, name: 'Quiz Mode', icon: '🏆', category: 'Mixed', avgTime: '15 min', difficulty: 'Easy→Hard', studentsCompleted: 0, avgScore: 0, description: 'Mixed quiz from all activities. 15 questions, shuffled every session!' },
  ];

  const handleStartActivity = (activity) => {
    const diff = activityDifficulty[activity.id] || 'easy';
    setRunningDifficulty(diff);
    setRunningActivity(activity);
  };

  const handleConfigureActivity = (activity) => { setSelectedActivity(activity); setShowConfigModal(true); };

  // Generate a stable student ID from any real face-detected name
  const makeStudentId = (name) => {
    if (!name) return 'student-unknown';
    return 'student-' + name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleStudentDone = useCallback(async ({ stars, score, studentName }) => {
    const act = runningActivity;
    const sName = studentName ?? 'Unknown';

    // ── Step 1: MongoDB se real _id lo ──────────────────────────
    let realStudentId = null;
    try {
      const res = await axios.post(API_ENDPOINTS.GET_STUDENT_ID, { name: sName });
      if (res.data?.status === 'found') {
        realStudentId = res.data.student_id;
        console.log(`✅ Real MongoDB ID found: ${realStudentId}`);
      } else {
        console.warn(`⚠️ Student "${sName}" not found in DB — using fallback ID`);
      }
    } catch (e) {
      console.warn('Could not fetch student ID from DB:', e);
    }

    // Fallback: agar DB mein na mile toh naam se string banao
    const studentId = realStudentId ??
      ('student-' + sName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));

    // ── Step 2: StarContext mein save karo ──────────────────────
    addActivityResult({
      studentId,
      studentName: sName,
      activityId: act?.id ?? 0,
      activityName: act?.name ?? 'Activity',
      stars,
      score,
    });

    // ── Step 3: Backend mein save karo ─────────────────────────
    axios.post(`${API_BASE_URL}/save-activity-result`, {
      student_id: studentId,
      student_name: sName,
      activity_id: act?.id ?? 0,
      activity_name: act?.name ?? 'Activity',
      stars,
      score,
    }).catch(() => { });

    setLastResult({ stars, score, studentName: sName, activityName: act?.name });
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 5000);

  }, [addActivityResult, runningActivity]); // eslint-disable-line
  const handleClose = useCallback(() => setRunningActivity(null), []);

  return (
    <>
      {runningActivity && (
        <MimiActivityOverlay
          activity={runningActivity}
          difficulty={runningDifficulty}
          onStudentDone={handleStudentDone}
          onClose={handleClose}
          isParentMode={isParentMode}
        />
      )}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">Learning Activities</h1>
            <p className="text-text/60">Manage and launch classroom activities</p>
          </div>
          <Button variant="primary" icon={Plus}>Create Custom Activity</Button>
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {showBanner && lastResult && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center gap-4 text-white">
              <div className="text-4xl">🎉</div>
              <div>
                <p className="font-bold text-lg">{lastResult.activityName} complete!</p>
                <p className="text-white/90">
                  {lastResult.studentName} earned {[...Array(5)].map((_, i) => <span key={i}>{i < lastResult.stars ? '⭐' : '☆'}</span>)} — live in Students &amp; Parent portal!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Activities</p>
            <p className="text-4xl font-bold text-blue-900">{activities.length}</p>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-sm text-green-700 mb-1">Completions</p>
            <p className="text-4xl font-bold text-green-900">{activities.reduce((s, a) => s + a.studentsCompleted, 0)}</p>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Avg Score</p>
            <p className="text-4xl font-bold text-purple-900">
              {(activities.filter(a => a.avgScore > 0).reduce((s, a) => s + a.avgScore, 0) / activities.filter(a => a.avgScore > 0).length).toFixed(1)}/5
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Avg Duration</p>
            <p className="text-4xl font-bold text-yellow-900">11m</p>
          </Card>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <motion.div key={activity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center text-4xl">{activity.icon}</div>
                    <div>
                      <h3 className="font-bold text-text text-lg">{activity.name}</h3>
                      <p className="text-sm text-text/60">{activity.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {activity.id > 6 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-lg">NEW</span>
                    )}
                    {activity.id >= 9 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-lg">🤖 AI</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text/70 mb-4">{activity.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text/60">Difficulty:</span>
                    {(() => {
                      const d = activityDifficulty[activity.id] || 'easy';
                      const cfg = {
                        easy: ['bg-green-100 text-green-700', 'Easy'],
                        medium: ['bg-yellow-100 text-yellow-700', 'Medium'],
                        hard: ['bg-red-100 text-red-700', 'Hard'],
                      }[d];
                      return <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${cfg[0]}`}>{cfg[1]}</span>;
                    })()}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text/60">Avg Time:</span>
                    <span className="font-semibold text-text flex items-center gap-1"><Clock size={14} />{activity.avgTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                  <Users size={16} className="text-text/60" />
                  <span className="text-sm text-text/70">
                    {activity.studentsCompleted > 0
                      ? <><strong>{activity.studentsCompleted}</strong> completions</>
                      : <span className="text-purple-500 font-semibold">Ready to use!</span>}
                  </span>
                  {activity.avgScore > 0 && <span className="ml-auto text-sm font-semibold text-text">⭐ {activity.avgScore}/5</span>}
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" icon={Play} className="flex-1" onClick={() => handleStartActivity(activity)}>Start</Button>
                  <Button variant="outline" icon={Settings} onClick={() => handleConfigureActivity(activity)}>Config</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Configure Modal */}
        {selectedActivity && (
          <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} title={`Configure: ${selectedActivity.name}`} size="md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Difficulty Level</label>
                <select
                  value={activityDifficulty[selectedActivity.id] || 'easy'}
                  onChange={e => setActivityDifficulty(prev => ({ ...prev, [selectedActivity.id]: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Time Limit (minutes)</label>
                <input type="number" defaultValue={15} className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Number of Questions</label>
                <input type="number" defaultValue={10} className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400" />
              </div>
              {selectedActivity.id >= 9 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800 font-semibold mb-1">🤖 AI-Powered Activity</p>
                  <p className="text-xs text-blue-600">
                    This activity generates <strong>fresh questions every session</strong> using AI.
                    Questions automatically match the selected difficulty level.
                  </p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-800">ℹ️ These settings will apply the next time this activity is launched.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={() => setShowConfigModal(false)}>Save Settings</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowConfigModal(false)}>Cancel</Button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </>
  );
};

export default ActivitiesTab;
