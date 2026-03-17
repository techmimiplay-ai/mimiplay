// import React, { useState, useRef, useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { ChevronDown, User } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const ParentChildSelector = ({ selectedChild, onSelectChild }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [position, setPosition] = useState({ top: 0, right: 0 });
//   const buttonRef = useRef(null);

//   // Mock data - would come from API in real app
//   const children = [
//     { id: 1, name: 'Aarav Sharma', age: 5, avatar: 'AS' },
//     { id: 2, name: 'Anaya Sharma', age: 7, avatar: 'ANS' },
//   ];

//   const selected = children.find(c => c.id === selectedChild) || children[0];

//   // Update dropdown position when button position changes
//   useEffect(() => {
//     if (isOpen && buttonRef.current) {
//       const rect = buttonRef.current.getBoundingClientRect();
//       setPosition({
//         top: rect.bottom + 8,
//         right: window.innerWidth - rect.right,
//       });
//     }
//   }, [isOpen]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (buttonRef.current && !buttonRef.current.contains(e.target)) {
//         setIsOpen(false);
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       return () => document.removeEventListener('mousedown', handleClickOutside);
//     }
//   }, [isOpen]);

//   const dropdownContent = (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -10 }}
//           style={{
//             position: 'fixed',
//             top: `${position.top}px`,
//             right: `${position.right}px`,
//             zIndex: 99999,
//           }}
//           className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 w-64"
//         >
//           {children.map((child) => (
//             <motion.button
//               key={child.id}
//               onClick={() => {
//                 onSelectChild(child.id);
//                 setIsOpen(false);
//               }}
//               className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
//                 selected.id === child.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
//               }`}
//             >
//               <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
//                 {child.avatar}
//               </div>
//               <div className="flex-1">
//                 <p className="font-semibold text-text">{child.name}</p>
//                 <p className="text-xs text-text/60">Age {child.age}</p>
//               </div>
//               {selected.id === child.id && (
//                 <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
//               )}
//             </motion.button>
//           ))}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );

//   return (
//     <>
//       <button
//         ref={buttonRef}
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:shadow-lg transition-shadow relative"
//       >
//         <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
//           {selected.avatar}
//         </div>
//         <div className="text-left">
//           <p className="text-xs text-white/80">My Child</p>
//           <p className="font-semibold">{selected.name}</p>
//         </div>
//         <ChevronDown
//           size={18}
//           className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
//         />
//       </button>

//       {createPortal(dropdownContent, document.body)}
//     </>
//   );
// };

// export default ParentChildSelector;







import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config';

const ParentChildSelector = ({ selectedChild, onSelectChild }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState([]); // Dynamic state
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  // Mock data - would come from API in real app
  // const children = [
  //   { id: 1, name: 'Aarav Sharma', age: 5, avatar: 'AS' },
  //   { id: 2, name: 'Anaya Sharma', age: 7, avatar: 'ANS' },
  // ];

  useEffect(() => {
    const fetchChildren = async () => {
      const parentId = localStorage.getItem('userId');
      if (!parentId) return;

      try {
        // Aapko ye API backend mein banani hogi (main niche code de raha hoon)
        const res = await fetch(`${API_BASE_URL}/api/parent/my-children/${parentId}`);
        const data = await res.json();

        if (res.ok) {
          // Naam ke initials nikalne ke liye function
          const formattedData = data.map(child => ({
            id: child.id || child._id,  // ✅ dono handle karo
            name: child.name,
            class: child.class,
            roll_number: child.roll_number,
            avatar: child.name.split(' ').map(n => n[0]).join('').toUpperCase()
          }));

          setChildren(formattedData);

          // Agar koi child selected nahi hai, toh pehle wale ko select kar lo
          if (!selectedChild && formattedData.length > 0) {
            // onSelectChild(formattedData[0].id);
            onSelectChild(formattedData[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching children:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // const selected = children.find(c => c.id === selectedChild) || children[0];
  const selected = selectedChild || children[0];

  // Update dropdown position when button position changes
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (loading) return <div className="flex items-center gap-2 text-white/70 text-sm"><Loader2 className="animate-spin" size={16} /> Loading...</div>;
  if (!selected) return null;

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            right: `${position.right}px`,
            zIndex: 99999,
          }}
          className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 w-64"
        >
          {children.map((child) => (
            <motion.button
              key={child.id}
              onClick={() => {
                onSelectChild(child);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selected.id === child.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {child.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text">{child.name}</p>
                <p className="text-xs text-text/60">Age {child.age}</p>
              </div>
              {selected.id === child.id && (
                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:shadow-lg transition-shadow relative"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
          {selected.avatar}
        </div>
        <div className="text-left">
          <p className="text-xs text-white/80">My Child</p>
          <p className="font-semibold">{selected.name}</p>
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {createPortal(dropdownContent, document.body)}
    </>
  );
};

export default ParentChildSelector;