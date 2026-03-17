// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthLayout } from '../layouts';
// import { Button, Input } from '../components/shared';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import { motion } from 'framer-motion';

// // Test credentials for all account types
// const TEST_ACCOUNTS = {
//   admin: {
//     email: 'admin@alexi.com',
//     password: 'admin123'
//   },
//   teacher: {
//     email: 'teacher@alexi.com',
//     password: 'teacher123'
//   },
//   parent: {
//     email: 'parent@alexi.com',
//     password: 'parent123'
//   }
// };

// const Login = () => {
//   const navigate = useNavigate(); // ← ADD THIS
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     rememberMe: false
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validate = () => {
//     const newErrors = {};
    
//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
    
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const newErrors = validate();
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
    
//     setLoading(true);
    
//     // Simulate API call and validate credentials
//     setTimeout(() => {
//       console.log('Login data:', formData);
      
//       // Check credentials against test accounts
//       let userRole = null;
      
//       if (formData.email === TEST_ACCOUNTS.admin.email && 
//           formData.password === TEST_ACCOUNTS.admin.password) {
//         userRole = 'admin';
//       } else if (formData.email === TEST_ACCOUNTS.teacher.email && 
//                  formData.password === TEST_ACCOUNTS.teacher.password) {
//         userRole = 'teacher';
//       } else if (formData.email === TEST_ACCOUNTS.parent.email && 
//                  formData.password === TEST_ACCOUNTS.parent.password) {
//         userRole = 'parent';
//       } else {
//         setErrors({ email: 'Invalid email or password' });
//         setLoading(false);
//         return;
//       }
      
//       // Navigate based on detected role
//       if (userRole === 'teacher') {
//         // navigate('/teacher/home');
//         navigate('/teacher/selection');
//       } else if (userRole === 'parent') {
//         navigate('/parent/home');
//       } else if (userRole === 'admin') {
//         navigate('/admin/dashboard');
//       }
      
//       setLoading(false);
//     }, 1500);
//   };

//   return (
//     <AuthLayout
//       title="Welcome Back!"
//       subtitle="Sign in to continue to Alexi"
//     >
//       <form onSubmit={handleSubmit} className="space-y-5">
        
//         {/* Email Input */}
//         <Input
//           label="Email Address"
//           type="email"
//           name="email"
//           placeholder="Enter your email"
//           icon={Mail}
//           value={formData.email}
//           onChange={handleChange}
//           error={errors.email}
//         />
        
//         {/* Password Input with Toggle */}
//         <div>
//           <label className="block text-sm font-semibold text-text mb-2">
//             Password
//           </label>
//           <div className="relative">
//             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
//               <Lock size={20} />
//             </div>
//             <input
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               placeholder="Enter your password"
//               value={formData.password}
//               onChange={handleChange}
//               className={`
//                 w-full px-4 py-3 pl-12 pr-12 rounded-2xl border-2 border-gray-200
//                 bg-white text-text placeholder-gray-400
//                 transition-all duration-200
//                 focus:border-primary-400 focus:ring-2 focus:ring-primary-200
//                 ${errors.password ? 'border-red-400' : ''}
//               `}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition-colors"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>
//           {errors.password && (
//             <motion.p
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-red-500 text-sm mt-1"
//             >
//               {errors.password}
//             </motion.p>
//           )}
//         </div>
        
//         {/* Remember Me & Forgot Password */}
//         <div className="flex items-center justify-between">
//           <label className="flex items-center gap-2 cursor-pointer">
//             <input
//               type="checkbox"
//               name="rememberMe"
//               checked={formData.rememberMe}
//               onChange={handleChange}
//               className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
//             />
//             <span className="text-sm text-text">Remember me</span>
//           </label>
          
//           {/* ↓↓↓ UPDATED: Add onClick to navigate */}
//           <button
//             type="button"
//             onClick={() => navigate('/forgot-password')}
//             className="text-sm text-primary-600 font-semibold hover:text-primary-700"
//           >
//             Forgot Password?
//           </button>
//         </div>
        
//         {/* Submit Button */}
//         <Button
//           type="submit"
//           variant="primary"
//           size="lg"
//           className="w-full"
//           loading={loading}
//         >
//           Sign In
//         </Button>
        
//         {/* Divider */}
//         <div className="relative my-6">
//           <div className="absolute inset-0 flex items-center">
//             <div className="w-full border-t border-gray-200"></div>
//           </div>
//           <div className="relative flex justify-center text-sm">
//             <span className="px-4 bg-white text-gray-500">Or continue with</span>
//           </div>
//         </div>
        
//         {/* Social Login Buttons */}
//         <div className="grid grid-cols-2 gap-4">
//           <button
//             type="button"
//             className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
//           >
//             <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
//             <span className="font-semibold text-text">Google</span>
//           </button>
//           <button
//             type="button"
//             className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
//           >
//             <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-5 h-5" />
//             <span className="font-semibold text-text">Microsoft</span>
//           </button>
//         </div>
        
//         {/* Register Link */}
//         <p className="text-center text-sm text-text/60 mt-6">
//           Don't have an account?{' '}
//           {/* ↓↓↓ UPDATED: Add onClick to navigate */}
//           <button
//             type="button"
//             onClick={() => navigate('/register')}
//             className="text-primary-600 font-semibold hover:text-primary-700"
//           >
//             Create Account
//           </button>
//         </p>
//       </form>
//     </AuthLayout>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts';
import { Button, Input } from '../components/shared';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

// Test credentials for all account types
// const TEST_ACCOUNTS = {
//   admin: {
//     email: 'admin@alexi.com',
//     password: 'admin123'
//   },
//   teacher: {
//     email: 'teacher@alexi.com',
//     password: 'teacher123'
//   },
//   parent: {
//     email: 'parent@alexi.com',
//     password: 'parent123'
//   }
// };

const Login = () => {
  const navigate = useNavigate(); // ← ADD THIS
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const newErrors = validate();
  //   if (Object.keys(newErrors).length > 0) {
  //     setErrors(newErrors);
  //     return;
  //   }

  //   setLoading(true);

  //   // Simulate API call and validate credentials
  //   setTimeout(() => {
  //     console.log('Login data:', formData);

  //     // Check credentials against test accounts
  //     let userRole = null;

  //     if (formData.email === TEST_ACCOUNTS.admin.email && 
  //         formData.password === TEST_ACCOUNTS.admin.password) {
  //       userRole = 'admin';
  //     } else if (formData.email === TEST_ACCOUNTS.teacher.email && 
  //                formData.password === TEST_ACCOUNTS.teacher.password) {
  //       userRole = 'teacher';
  //     } else if (formData.email === TEST_ACCOUNTS.parent.email && 
  //                formData.password === TEST_ACCOUNTS.parent.password) {
  //       userRole = 'parent';
  //     } else {
  //       setErrors({ email: 'Invalid email or password' });
  //       setLoading(false);
  //       return;
  //     }

  //     // Navigate based on detected role
  //     if (userRole === 'teacher') {
  //       navigate('/teacher/home');
  //     } else if (userRole === 'parent') {
  //       navigate('/parent/home');
  //     } else if (userRole === 'admin') {
  //       navigate('/admin/dashboard');
  //     }

  //     setLoading(false);
  //   }, 1500);
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.user_id);

      // Redirect based on role
      if (data.role === "admin") navigate("/admin/dashboard");
      else if (data.role === "teacher") navigate("/teacher/selection");
      else if (data.role === "parent") navigate("/parent-selection");

    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue to Alexi"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* Password Input with Toggle */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 pl-12 pr-12 rounded-2xl border-2 border-gray-200
                bg-white text-text placeholder-gray-400
                transition-all duration-200
                focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                ${errors.password ? 'border-red-400' : ''}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
            />
            <span className="text-sm text-text">Remember me</span>
          </label>

          {/* ↓↓↓ UPDATED: Add onClick to navigate */}
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-primary-600 font-semibold hover:text-primary-700"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Sign In
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="font-semibold text-text">Google</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-5 h-5" />
            <span className="font-semibold text-text">Microsoft</span>
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-text/60 mt-6">
          Don't have an account?{' '}
          {/* ↓↓↓ UPDATED: Add onClick to navigate */}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-primary-600 font-semibold hover:text-primary-700"
          >
            Create Account
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;