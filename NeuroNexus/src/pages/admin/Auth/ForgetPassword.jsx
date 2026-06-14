import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../context/Firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import './ForgetPassword.css';

function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitted(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin/login');
  };

  return (
    <div className="admin-fp-container">
      <div className="admin-fp-wrapper">
        {/* Left Panel - Form / Success */}
        <div className="admin-fp-form-panel">
          {/* Logo */}
          <div className="admin-fp-logo-section">
            <div className="admin-fp-logo-icon">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" />
            </div>
            <h1 className="admin-fp-logo-text">NeuroNexus</h1>
          </div>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="admin-fp-header">
                <h2 className="admin-fp-title">Forgot Password?</h2>
                <p className="admin-fp-subtitle">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="admin-fp-form">
                <div className="admin-fp-form-group">
                  <label htmlFor="email" className="admin-fp-form-label">Email Address</label>
                  <div className="admin-fp-input-with-icon">
                    <i className="bi bi-envelope"></i>
                    <input
                      type="email"
                      id="email"
                      className="admin-fp-form-input"
                      placeholder="admin@neuronexus.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '14px', borderRadius: '10px' }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                <button type="submit" className="admin-fp-btn-reset-password" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <i className="bi bi-send ms-2"></i>
                    </>
                  )}
                </button>
              </form>

              <div className="admin-fp-back-to-login">
                <button onClick={handleBackToLogin} className="admin-fp-link-button">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <div className="admin-fp-success-state">
              <div className="admin-fp-success-animation">
                <div className="admin-fp-success-circle">
                  <i className="bi bi-check-lg"></i>
                </div>
              </div>
              <h2 className="admin-fp-success-title">Check Your Email</h2>
              <p className="admin-fp-success-message">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <p className="admin-fp-success-note">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button className="admin-fp-btn-back-login" onClick={handleBackToLogin}>
                <i className="bi bi-arrow-left me-2"></i>
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Hero Decoration & Illustration */}
        <div className="admin-fp-hero-panel">
          <div className="admin-fp-hero-decoration">
            <div className="admin-fp-hero-circle admin-fp-hero-circle-1"></div>
            <div className="admin-fp-hero-circle admin-fp-hero-circle-2"></div>
          </div>
          <div className="admin-fp-hero-content">
            <h2 className="admin-fp-hero-title">Recover Your Account</h2>
            <p className="admin-fp-hero-subtitle">
              Quick and secure password recovery to get you back to managing your workspace in no time.
            </p>
            <div className="admin-fp-hero-illustration">
              <div className="admin-fp-illustration-recovery">
                <div className="admin-fp-shield">
                  <div className="admin-fp-shield-inner">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                </div>
                <div className="admin-fp-key">
                  <div className="admin-fp-key-ring"></div>
                  <div className="admin-fp-key-bits"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
