// src/context/StarContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STAR STORE — live across Teacher + Parent portals
//
// TWO sync mechanisms:
//  1. window 'storage' event  → fires instantly when a DIFFERENT browser tab
//     writes to localStorage (teacher tab → parent tab auto-updates)
//  2. setInterval poll every 2s → catches same-app navigation edge cases
//     where the storage event doesn't fire (same-origin same-tab)
//
// Stars are saved to localStorage so they survive page refresh.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'alexi_star_results';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const StarContext = createContext(null);

export function StarProvider({ children }) {
  const [results, setResults] = useState(load);

  // ── Sync mechanism 1: cross-tab via storage event ─────────────────────────
  // When teacher tab writes stars, browser fires 'storage' on all OTHER tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setResults(load());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ── Sync mechanism 2: poll every 2 seconds ────────────────────────────────
  // Catches cases where parent portal is on the same tab/app instance
  // and the storage event doesn't fire. Also acts as a safety net.
  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = load();
      setResults(prev => {
        // Only update if data actually changed (compare lengths + latest id)
        if (fresh.length !== prev.length) return fresh;
        if (fresh.length > 0 && prev.length > 0 && fresh[0].id !== prev[0].id) return fresh;
        return prev; // no change, don't re-render
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /** Called by ActivitiesTab when a student finishes an activity */
  const addActivityResult = useCallback(({ studentId, studentName, activityId, activityName, stars, score }) => {
    const entry = {
      id:           Date.now(),
      studentId:    studentId    ?? 'student-1',
      studentName:  studentName  ?? 'Aarav Sharma',
      activityId:   activityId   ?? 0,
      activityName: activityName ?? 'Activity',
      stars:        Math.min(5, Math.max(0, stars ?? 0)),
      score:        score ?? 0,
      timestamp:    new Date().toISOString(),
      date:         new Date().toDateString(),
    };
    setResults(prev => {
      const updated = [entry, ...prev];
      save(updated);
      return updated;
    });
  }, []);

  /** All results for one student (newest first) */
  const getStudentResults = useCallback((studentId) =>
    results.filter(r => r.studentId === studentId),
  [results]);

  /** Total stars ever earned by a student */
  const getTotalStars = useCallback((studentId) =>
    results.filter(r => r.studentId === studentId).reduce((s, r) => s + r.stars, 0),
  [results]);

  /** Stars earned today by a student */
  const getTodayStars = useCallback((studentId) => {
    const today = new Date().toDateString();
    return results
      .filter(r => r.studentId === studentId && r.date === today)
      .reduce((s, r) => s + r.stars, 0);
  }, [results]);

  /** Number of activities completed today */
  const getTodayActivities = useCallback((studentId) => {
    const today = new Date().toDateString();
    return results.filter(r => r.studentId === studentId && r.date === today).length;
  }, [results]);

  /** Clear everything (for testing) */
  const clearAll = useCallback(() => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <StarContext.Provider value={{
      results,
      addActivityResult,
      getStudentResults,
      getTotalStars,
      getTodayStars,
      getTodayActivities,
      clearAll,
    }}>
      {children}
    </StarContext.Provider>
  );
}

export function useStars() {
  const ctx = useContext(StarContext);
  if (!ctx) throw new Error('useStars must be used inside <StarProvider>');
  return ctx;
}

export default StarContext;