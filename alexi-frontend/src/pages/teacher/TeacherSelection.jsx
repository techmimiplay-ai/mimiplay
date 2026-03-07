import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, PlayCircle } from 'lucide-react';

const TeacherSelection = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Chat with Alexi',
      desc: 'Start an interactive session with Mimi',
      icon: <MessageCircle size={48} />,
      path: '/mimi-chat',
      color: 'from-purple-400 to-indigo-500',
      emoji: '🤖'
    },
    {
      title: 'Perform Activities',
      desc: 'Explore games and learning tasks',
      icon: <PlayCircle size={48} />,
      path: '/teacher/activities',
      color: 'from-pink-400 to-rose-500',
      emoji: '🎮'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-gray-800 mb-12"
        >
          What would you like to do today? ✨
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {options.map((opt, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, translateY: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(opt.path)}
              className={`cursor-pointer bg-gradient-to-br ${opt.color} p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden group`}
            >
              <div className="absolute -right-4 -top-4 text-8xl opacity-20 group-hover:rotate-12 transition-transform">
                {opt.emoji}
              </div>
              <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mb-6">
                {opt.icon}
              </div>
              <h2 className="text-3xl font-bold mb-2">{opt.title}</h2>
              <p className="text-white/80 text-lg">{opt.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherSelection;