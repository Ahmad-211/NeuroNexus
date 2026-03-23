import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { loginAdmin, currentUser, userRole } = useFirebase();
  const { alert, showInfo, closeAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    firebase: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Redirect if already logged in as admin (only after login attempt)
  useEffect(() => {
    if (currentUser && userRole === 'admin' && shouldRedirect) {
      setIsLoading(false);
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, userRole, navigate, shouldRedirect]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

    try {
      const result = await loginAdmin(formData.email, formData.password);
      
      if (result.success) {
        console.log('Admin login successful:', result.user);
        setShouldRedirect(true);
        // Keep loading state - useEffect will handle navigation and reset loading
      } else {
        setErrors(prev => ({ ...prev, firebase: result.error || 'Login failed' }));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => ({ ...prev, firebase: error.message || 'An error occurred during login' }));
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/admin/forget-password');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Panel - Form */}
        <div className="login-form-panel">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" />
            </div>
            <h1 className="logo-text">NeuroNexus</h1>
          </div>

          {/* Header */}
          <div className="login-header">
            <h2 className="login-title">Log In</h2>
            <p className="login-subtitle">Welcome back! Sign in to Admin Portal</p>
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
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
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="form-options">
              <a 
                href="#" 
                className="forgot-password-link"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
      
            <div className="divider-line"></div>
          </div>

          {/* Social Buttons */}
          <div className="social-buttons">
          </div>
        </div>

        {/* Right Panel - Hero */}
        <div className="login-hero-panel">
          <div className="hero-decoration">
            <div className="hero-circle hero-circle-1"></div>
            <div className="hero-circle hero-circle-2"></div>
          </div>
          <div className="hero-content">
            <h2 className="hero-title">Welcome to Admin Portal</h2>
            <p className="hero-subtitle">
              Streamline healthcare management with powerful tools to oversee labs, monitor operations, and deliver exceptional patient care.
            </p>
            <div className="hero-illustration">
              {/* CSS Illustration - Person at Computer */}
              <div className="illustration-workspace">
                {/* Desk */}
                <div className="desk"></div>
                
                {/* Computer Monitor */}
                <div className="monitor">
                  <div className="monitor-screen">
                    <div className="screen-content">
                      <div className="screen-icon">👤</div>
                      <div className="screen-lines">
                        <div className="line"></div>
                        <div className="line"></div>
                      </div>
                    </div>
                  </div>
                  <div className="monitor-stand"></div>
                  <div className="monitor-base"></div>
                </div>
                
                {/* Person */}
                <div className="person">
                  <div className="person-head"></div>
                  <div className="person-body"></div>
                  <div className="person-arm-left"></div>
                  <div className="person-arm-right"></div>
                </div>
                
                {/* Chair */}
                <div className="chair">
                  <div className="chair-back"></div>
                  <div className="chair-seat"></div>
                </div>
                
                {/* Plant */}
                <div className="plant">
                  <div className="pot"></div>
                  <div className="leaf leaf-1"></div>
                  <div className="leaf leaf-2"></div>
                  <div className="leaf leaf-3"></div>
                </div>
                
                {/* Documents */}
                <div className="documents">
                  <div className="doc-page"></div>
                  <div className="doc-icon">📄</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
      />
    </div>
  );
}

export default Login;