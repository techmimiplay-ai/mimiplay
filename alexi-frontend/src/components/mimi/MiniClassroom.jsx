import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import bgImage from '../../assets/images/mimi/bg.jpg'; 

import mimiIdleVideo from '../../assets/images/mimi/mimiidell.mp4'
import mimiNeutralVideo from '../../assets/images/mimi/mimiidell.mp4'
import mimiWaveVideo from '../../assets/images/mimi/mimiwavehand_nobg.webm'
import mimiSadVideo from '../../assets/images/mimi/A Big Smile for a Happy Day.mp4'
import mimiHappyVideo from '../../assets/images/mimi/A Fantastic Day of Fun and Laughter.mp4'

const MimiClassroom = () => {
  const [status, setStatus] = useState('idle'); // idle, waving, talking
  const [log, setLog] = useState('Click to wake up Mimi');
  const [personName, setPersonName] = useState(''); // Senior's requirement: Hi (Person Name)
  const [mood, setMood] = useState('');

// Polling Logic: Har 1 second mein backend se status maangna
useEffect(() => {
  let interval;
  if (status !== 'idle') {
    interval = setInterval(async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_STATUS);

        // Agar backend ne kisi ko pehchan liya hai
        if (res.data.person) {
          setPersonName(res.data.person);
          setLog(`Mimi is talking to ${res.data.person}`);
          setStatus('talking'); // Person milte hi waving se talking mode

          // 2. Check if Mood is also Detected (Stage 2)
          // if (res.data.mood) {
          //   setMood(res.data.mood);
          //   setLog(`${res.data.person} is feeling ${res.data.mood}`);
          // } else {
          //   setLog(`Mimi is listening to ${res.data.person}...`);
          // }
          if (res.data.mood && res.data.mood !== "null" && res.data.mood !== "") {
            setMood(res.data.mood);
            setLog(`${res.data.person} is feeling ${res.data.mood}`);
          } else {
            // Jab tak mood process ho raha hai, Mimi ko listening mode mein rakho
            setMood('');
            setLog(`Mimi is listening to ${res.data.person}...`);
          }
        }
        console.log("Current Backend Data:", res.data);
      } catch (err) {
        console.log("Error fetching status from backend");
      }
    }, 1000);
  }
  return () => clearInterval(interval);
}, [status]);

  useEffect(() => {
  if (status === 'idle') return;

  const interval = setInterval(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.GET_STATUS);

      if (res.data.person) {
        setPersonName(res.data.person);
        setStatus('talking');

        if (res.data.mood) {
          setMood(res.data.mood);
          setLog(`${res.data.person} is feeling ${res.data.mood}`);
        } else {
          setMood('');
          setLog(`Mimi is listening to ${res.data.person}...`);
        }
      }
    } catch (err) {
      console.log("Polling error");
    }
  }, 1000);

  return () => clearInterval(interval);
}, [status]);

  const startSession = async () => {
    setStatus('waving');
    setLog('Mimi is looking for faces...');
    setPersonName(''); // Reset name on new session

    try {
      // Flask Backend Call to start camera thread
      await axios.get(API_ENDPOINTS.START_CLASSROOM);
    } catch (err) {
      setLog('Error: Flask server not responding');
      setStatus('idle');
    }
  };

  const getMimiImage = () => {
    if (status === 'idle') return mimiMainImg;
    if (status === 'waving' || (status === 'talking' && !mood)) return mimiWave;

    if (mood) {
      switch (mood.toLowerCase()) {
        case 'happy': return mimiHappy;
        case 'sad': return mimiSad;
        case 'neutral': return mimiNeutral;
        default: return mimiWave;
      }
    }
    return mimiWave;
  };

  const getMimiVideo = () => {
    if (status === 'idle') return mimiIdleVideo;
    if (status === 'waving' || (status === 'talking' && !mood)) return mimiWaveVideo;

    if (mood) {
      switch (mood.toLowerCase()) {
        case 'happy': return mimiHappyVideo;
        case 'sad': return mimiSadVideo;
        case 'neutral': return mimiNeutralVideo;
        default: return mimiWaveVideo;
      }
    }
    return mimiWaveVideo;
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-purple-200">

      {/* HI PERSON NAME - Senior's requirement */}
      <AnimatePresence>
        {personName && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-purple-100 px-6 py-2 rounded-full border-2 border-purple-400"
          >
            <h2 className="text-2xl font-black text-purple-700">
              Hi {personName}! 👋
            </h2>
            {mood && mood !== "Unknown" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-purple-500 uppercase mt-1"
              >
                You look {mood} today!
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

{/* Mimi Image Container */ }
      <motion.div
        key={mood || status}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="w-64 h-64 my-6"
      >
        <video
          src={getMimiVideo()}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain rounded-xl"
        />
      </motion.div>

      <div className="text-center">
        <p className="text-xl font-bold text-gray-500 mb-4 h-8">{log}</p>

        <button
          onClick={startSession}
          disabled={status !== 'idle'}
          className={`${status === 'idle' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 cursor-not-allowed'
            } text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform active:scale-95`}
        >
          {status === 'idle' ? 'Wake Up Mimi ☀️' : 'Mimi is Active'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default MimiClassroom;