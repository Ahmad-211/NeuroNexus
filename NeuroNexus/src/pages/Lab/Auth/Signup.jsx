import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './Signup.css';

function LabSignup() {
  const navigate = useNavigate();
  const { signupLab } = useFirebase();
  const { alert, showSuccess, closeAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    labName: '',
    email: '',
    phone: '',
    city: 'Faisalabad',
    address: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    licenseFile: null,
    logoFile: null,
    labTiming: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [logoFileName, setLogoFileName] = useState('');

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

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          licenseFile: 'Please upload a valid image (JPG, PNG) or PDF file'
        }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          licenseFile: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        licenseFile: file
      }));
      setFileName(file.name);
      setErrors(prev => ({
        ...prev,
        licenseFile: ''
      }));
    }
  };

  // Handle logo file upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (only images for logo)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          logoFile: 'Please upload a valid image (JPG, PNG)'
        }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logoFile: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        logoFile: file
      }));
      setLogoFileName(file.name);
      setErrors(prev => ({
        ...prev,
        logoFile: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Lab Name validation
    if (!formData.labName.trim()) {
      newErrors.labName = 'Lab name is required';
    } else if (formData.labName.trim().length < 3) {
      newErrors.labName = 'Lab name must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Contact number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid contact number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address';
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

    // License Number validation
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    // License File validation
    if (!formData.licenseFile) {
      newErrors.licenseFile = 'License copy is required';
    }

    // Logo File validation
    if (!formData.logoFile) {
      newErrors.logoFile = 'Lab logo is required';
    }

    // Lab Timing validation
    if (!formData.labTiming.trim()) {
      newErrors.labTiming = 'Lab timing is required';
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

    try {
      const result = await signupLab({
        name: formData.labName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        licenseNumber: formData.licenseNumber,
        labTiming: formData.labTiming,
        licenseFile: formData.licenseFile,
        logoFile: formData.logoFile
      });

      if (result.success) {
        console.log('Lab signup successful:', result.user);
        // Show success message and redirect to login
        showSuccess('Registration Successful!', 'Your account is under review. You will be notified upon approval.');
        setTimeout(() => {
          navigate('/lab/login');
        }, 3000);
      } else {
        setErrors(prev => ({ ...prev, firebase: result.error || 'Signup failed' }));
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors(prev => ({ ...prev, firebase: error.message || 'An error occurred during signup' }));
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="signup-title">Lab Registration</h2>
            <p className="signup-subtitle">Create your laboratory account</p>
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
            {/* Lab Name */}
            <div className="form-group">
              <label htmlFor="labName" className="form-label">
                Lab Name
              </label>
              <input
                type="text"
                id="labName"
                name="labName"
                value={formData.labName}
                onChange={handleChange}
                className={`form-input ${errors.labName ? 'error' : ''}`}
                placeholder="Enter lab name"
              />
              {errors.labName && (
                <span className="form-error">{errors.labName}</span>
              )}
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

            {/* Contact Number */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Contact Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="Enter contact number"
                autoComplete="tel"
              />
              {errors.phone && (
                <span className="form-error">{errors.phone}</span>
              )}
            </div>

            {/* City (Location) */}
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                Location (City)
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                className="form-input"
                readOnly
                style={{ backgroundColor: '#F3F4F6', cursor: 'not-allowed' }}
              />
              <span className="form-hint">Currently serving Faisalabad only</span>
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`form-input form-textarea ${errors.address ? 'error' : ''}`}
                placeholder="Enter complete address in Faisalabad"
                rows="3"
              />
              {errors.address && (
                <span className="form-error">{errors.address}</span>
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

            {/* Professional Details Section */}
            <div className="section-divider">
              <h3 className="section-title">Professional Details</h3>
            </div>

            {/* License Number */}
            <div className="form-group">
              <label htmlFor="licenseNumber" className="form-label">
                License Number
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className={`form-input ${errors.licenseNumber ? 'error' : ''}`}
                placeholder="Enter lab license number"
              />
              {errors.licenseNumber && (
                <span className="form-error">{errors.licenseNumber}</span>
              )}
            </div>

            {/* License Copy Upload */}
            <div className="form-group">
              <label htmlFor="licenseFile" className="form-label">
                License Copy
              </label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="licenseFile"
                  name="licenseFile"
                  onChange={handleFileChange}
                  className="file-input"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <label htmlFor="licenseFile" className="file-upload-label">
                  <i className="bi bi-cloud-upload"></i>
                  <span>{fileName || 'Upload license copy (JPG, PNG, PDF)'}</span>
                </label>
              </div>
              {errors.licenseFile && (
                <span className="form-error">{errors.licenseFile}</span>
              )}
              <span className="form-hint">Max file size: 5MB</span>
            </div>

            {/* Lab Logo Upload */}
            <div className="form-group">
              <label htmlFor="logoFile" className="form-label">
                Lab Logo
              </label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="logoFile"
                  name="logoFile"
                  onChange={handleLogoChange}
                  className="file-input"
                  accept="image/jpeg,image/jpg,image/png"
                />
                <label htmlFor="logoFile" className="file-upload-label">
                  <i className="bi bi-image"></i>
                  <span>{logoFileName || 'Upload lab logo (JPG, PNG)'}</span>
                </label>
              </div>
              {errors.logoFile && (
                <span className="form-error">{errors.logoFile}</span>
              )}
              <span className="form-hint">Max file size: 5MB</span>
            </div>

            {/* Lab Timing */}
            <div className="form-group">
              <label htmlFor="labTiming" className="form-label">
                Lab Timing
              </label>
              <input
                type="text"
                id="labTiming"
                name="labTiming"
                value={formData.labTiming}
                onChange={handleChange}
                className={`form-input ${errors.labTiming ? 'error' : ''}`}
                placeholder="e.g., Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
              />
              {errors.labTiming && (
                <span className="form-error">{errors.labTiming}</span>
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
          </div>

          {/* Social Buttons */}
          

          {/* Footer */}
          <div className="signup-footer">
            <p className="footer-text">
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/lab/login'); }} className="support-link">
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
            <h2 className="hero-title">Join Lab Network</h2>
            <p className="hero-subtitle">
              Register your laboratory to access our comprehensive testing platform and connect with healthcare providers.
            </p>
            <div className="hero-illustration">
              {/* CSS Illustration - Lab Workspace */}
              <div className="illustration-workspace">
                {/* Desk */}
                <div className="desk"></div>
                
                {/* Computer Monitor */}
                <div className="monitor">
                  <div className="monitor-screen">
                    <div className="screen-content">
                      <div className="screen-icon">🧪</div>
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
                  <div className="doc-icon">📊</div>
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

export default LabSignup;
