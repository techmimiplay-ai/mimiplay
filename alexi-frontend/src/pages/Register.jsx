import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← ADD THIS
import { AuthLayout } from '../layouts';
import { Button, Input } from '../components/shared';
import { User, Mail, Lock, Phone, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate(); // ← ADD THIS
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'teacher',
    school: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.school && formData.role === 'teacher') {
      newErrors.school = 'School name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    // setTimeout(() => {
    //   console.log('Register data:', formData);
    //   alert('Registration successful! (Pending admin approval)');
      
    //   // ↓↓↓ UPDATED: Navigate to login after successful registration
    //   navigate('/login');
      
    //   setLoading(false);
    // }, 1500);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg);

      alert("Registered! Wait for admin approval.");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Alexi Smart Learning Platform"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          icon={User}
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />
        
        {/* Email */}
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
        
        {/* Phone */}
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          icon={Phone}
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
              className={`
                px-4 py-3 rounded-2xl border-2 font-semibold transition-all
                ${formData.role === 'teacher'
                  ? 'border-primary-400 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-text hover:border-gray-300'
                }
              `}
            >
              👨‍🏫 Teacher
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'parent' }))}
              className={`
                px-4 py-3 rounded-2xl border-2 font-semibold transition-all
                ${formData.role === 'parent'
                  ? 'border-primary-400 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-text hover:border-gray-300'
                }
              `}
            >
              👨‍👩‍👧 Parent
            </button>
          </div>
        </div>
        
        {/* School Name (only for teachers) */}
        {formData.role === 'teacher' && (
          <Input
            label="School Name"
            type="text"
            name="school"
            placeholder="Enter school name"
            icon={Building2}
            value={formData.school}
            onChange={handleChange}
            error={errors.school}
          />
        )}
        
        {/* Password */}
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        
        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          icon={Lock}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        
        {/* Terms & Conditions */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
            />
            <span className="text-sm text-text">
              I agree to the{' '}
              <button type="button" className="text-primary-600 font-semibold">
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button type="button" className="text-primary-600 font-semibold">
                Privacy Policy
              </button>
            </span>
          </label>
          {errors.agreeToTerms && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.agreeToTerms}
            </motion.p>
          )}
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Create Account
        </Button>
        
        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800">
            ℹ️ Your account will be reviewed by an administrator before you can access the platform.
          </p>
        </div>
        
        {/* Login Link */}
        <p className="text-center text-sm text-text/60 mt-6">
          Already have an account?{' '}
          {/* ↓↓↓ UPDATED: Add onClick to navigate */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary-600 font-semibold hover:text-primary-700"
          >
            Sign In
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;