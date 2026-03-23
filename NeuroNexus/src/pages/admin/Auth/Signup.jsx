import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function AdminSignup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: '',
    firebase: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, firebase: '' }));

    // TODO: Implement Firebase/Node.js authentication here
    // Example structure for future implementation:
    /*
    try {
      // Firebase Auth:
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      
      // OR Node.js API:
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      
      // Store token and redirect to dashboard
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (error) {
      setErrors({ firebase: error.message });
    } finally {
      setIsLoading(false);
    }
    */

    // Simulated signup for UI demonstration
    setTimeout(() => {
      setIsLoading(false);
      console.log('Admin Signup submitted:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      // Navigate to admin dashboard on successful signup
      navigate('/admin/dashboard');
    }, 1500);
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        {/* Left Panel - Form */}
        <div className="signup-form-panel">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" />
            </div>
            <h1 className="logo-text">NeuroNexus</h1>
          </div>

          {/* Header */}
          <div className="signup-header">
            <h2 className="signup-title">Create Account</h2>
            <p className="signup-subtitle">Join the Admin Portal today</p>
          </div>

          {/* Firebase Error Message */}
          {errors.firebase && (
            <div className="firebase-error-container">
              <div className="firebase-error">
                <i className="bi bi-exclamation-circle"></i>
                <span>{errors.firebase}</span>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="signup-form">
            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="John"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <span className="form-error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <span className="form-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="terms-group">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="terms-checkbox"
              />
              <label htmlFor="agreeToTerms" className="terms-label">
                I agree to the{' '}
                <a href="#" className="terms-link" onClick={(e) => e.preventDefault()}>
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="terms-link" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <span className="form-error" style={{ display: 'block', marginTop: '-1rem', marginBottom: '1rem' }}>
                {errors.agreeToTerms}
              </span>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="signup-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">Or continue with</span>
            <div className="divider-line"></div>
          </div>

          {/* Social Buttons */}
          <div className="social-buttons">
            <button type="button" className="social-btn">
              <i className="bi bi-google"></i>
              Google
            </button>
            <button type="button" className="social-btn">
              <i className="bi bi-facebook"></i>
              Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="signup-footer">
            <p className="footer-text">
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/login'); }} className="support-link">
                Log in
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel - Hero */}
        <div className="signup-hero-panel">
          <div className="hero-decoration">
            <div className="hero-circle hero-circle-1"></div>
            <div className="hero-circle hero-circle-2"></div>
          </div>
          <div className="hero-content">
            <h2 className="hero-title">Powerful Admin Tools</h2>
            <p className="hero-subtitle">
              Manage your entire healthcare platform with comprehensive administrative controls and real-time analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignup;
