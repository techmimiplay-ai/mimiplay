import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ENDPOINTS } from '../config'

import bgImage from '../assets/images/mimi/bg.jpg'
import mimiIdleVideo from '../assets/images/mimi/mimiidell_nobg.webm'
import mimiWaveVideo from '../assets/images/mimi/mimiwavehand_nobg.webm'

const MimiChat = () => {
  const [sessionState, setSessionState] = useState('idle')
  const [mimiText, setMimiText] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [ytVideo, setYtVideo] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // no explicit pixel shift state; we animate left/x directly

  const pollingRef = useRef(null)

  const startSession = async () => {
    try {
      await axios.get(API_ENDPOINTS.START_MIMI_SESSION)
      setSessionState('running')
      startPolling()
    } catch (e) {
      console.error(e)
    }
  }

  const startPolling = () => {
    if (pollingRef.current) return
    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_MIMI_STATUS)
        const d = res.data
        // setMimiText(d.text)
        // setImageUrl(d.image_url)
        // setYtVideo(d.yt_video)
        // setSessionState(d.action || 'idle')
        if (d.text === "Thinking..." || !d.text) {
            // Wait for LLM to finish
        } else {
            // 2. Sirf tab update karo jab naya text aaye
            setMimiText(d.text);
            setImageUrl(d.image_url);
            setYtVideo(d.yt_video);
            setSessionState(d.action || 'idle');
        }
        if (d.action === 'playing_video' && d.yt_video) setPlaying(true)
      } catch (e) {
        console.error('Mimi poll error', e)
      }
    }, 500)
  }

  // Typewriter effect: reveal mimiText progressively
  useEffect(() => {
    if (!mimiText) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    setDisplayedText('')
    setIsTyping(true)
    const chars = Array.from(mimiText)
    let i = 0
    const speed = 30 // ms per char; adjust for slower/faster
    const t = setInterval(() => {
      i += 1
      setDisplayedText(chars.slice(0, i).join(''))
      if (i >= chars.length) {
        clearInterval(t)
        setIsTyping(false)
      }
    }, speed)

    return () => clearInterval(t)
  }, [mimiText])

  // Speak the full response using browser TTS once typing finishes
  useEffect(() => {
    if (!displayedText || isTyping) return
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(mimiText || displayedText)
        u.lang = 'en-US'
        u.rate = 0.95
        // window.speechSynthesis.speak(u)
      }
    } catch (e) {
      console.warn('Browser TTS failed', e)
    }
  }, [displayedText, isTyping, mimiText])

  // no explicit shift calculation; animate left/x directly for full-left effect

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="absolute top-8 right-8 z-50 flex items-center gap-2">
        <motion.button
          onClick={startSession}
          disabled={sessionState !== 'idle'}
          className={`px-6 py-3 rounded-full text-white bg-indigo-600`}
        >
          {sessionState === 'idle' ? 'Start Mimi Chat' : 'Session Running'}
        </motion.button>

        <motion.button
          onClick={() => {
            // Demo response for preview
            setSessionState('running')
            setMimiText('The sun is big and bright. It gives us light and keeps us warm.')
            setImageUrl('https://via.placeholder.com/600x360?text=Sun+Image')
            setYtVideo('https://www.youtube.com/watch?v=ysz5S6PUM-U')
            setPlaying(false)
          }}
          className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-800 shadow-sm"
        >
          Demo Response
        </motion.button>
      </div>

      {/* Mimi video (animates left when showing a response) */}
      <motion.div
        className="absolute bottom-0 z-30 w-[520px] h-[520px]"
        animate={mimiText ? { left: '12px', x: 0 } : { left: '50%', x: '-50%' }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        style={{ position: 'absolute' }}
      >
        <video
          src={mimiText ? mimiIdleVideo : (sessionState === 'running' ? mimiWaveVideo : mimiIdleVideo)}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* White response box */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 w-[700px] pointer-events-none">
        <AnimatePresence>
          {(mimiText || imageUrl || ytVideo) && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-2xl p-6 shadow-2xl pointer-events-auto"
            >
              <p className="text-2xl font-semibold text-gray-800 min-h-[64px]">
                {displayedText}
                <span className={`ml-1 text-gray-700 ${isTyping ? 'animate-pulse' : ''}`}> {isTyping ? '|' : ''}</span>
              </p>
              {imageUrl && (
                <div className="mt-4">
                  <img src={imageUrl} alt="mimi result" referrerPolicy="no-referrer" className="max-h-64 mx-auto rounded-md"  />
                </div>
              )}
              {ytVideo && (
                <div className="mt-4">
                  {!playing ? (
                    <button onClick={() => setPlaying(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Play Video</button>
                  ) : (
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYoutubeId(ytVideo)}?autoplay=1`}
                        title="YouTube video"
                        allow="autoplay; encrypted-media"
                        className="w-full h-64"
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function extractYoutubeId(url) {
  if (!url) return ''
  const m = url.match(/(youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)
  return m ? m[2] : url
}

export default MimiChat
