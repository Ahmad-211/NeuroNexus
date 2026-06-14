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
    navigate('/lab/login');
  };

  return (
    <div className="lab-fp-container">
      <div className="lab-fp-wrapper">
        {/* Left Panel - Form / Success */}
        <div className="lab-fp-form-panel">
          {/* Logo */}
          <div className="lab-fp-logo-section">
            <div className="lab-fp-logo-icon">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" />
            </div>
            <h1 className="lab-fp-logo-text">NeuroNexus</h1>
          </div>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="lab-fp-header">
                <h2 className="lab-fp-title">Forgot Password?</h2>
                <p className="lab-fp-subtitle">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="lab-fp-form">
                <div className="lab-fp-form-group">
                  <label htmlFor="email" className="lab-fp-form-label">Email Address</label>
                  <div className="lab-fp-input-with-icon">
                    <i className="bi bi-envelope"></i>
                    <input
                      type="email"
                      id="email"
                      className="lab-fp-form-input"
                      placeholder="lab@example.com"
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

                <button type="submit" className="lab-fp-btn-reset-password" disabled={loading}>
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

              <div className="lab-fp-back-to-login">
                <button onClick={handleBackToLogin} className="lab-fp-link-button">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <div className="lab-fp-success-state">
              <div className="lab-fp-success-animation">
                <div className="lab-fp-success-circle">
                  <i className="bi bi-check-lg"></i>
                </div>
              </div>
              <h2 className="lab-fp-success-title">Check Your Email</h2>
              <p className="lab-fp-success-message">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <p className="lab-fp-success-note">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button className="lab-fp-btn-back-login" onClick={handleBackToLogin}>
                <i className="bi bi-arrow-left me-2"></i>
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Hero Decoration & Illustration */}
        <div className="lab-fp-hero-panel">
          <div className="lab-fp-hero-decoration">
            <div className="lab-fp-hero-circle lab-fp-hero-circle-1"></div>
            <div className="lab-fp-hero-circle lab-fp-hero-circle-2"></div>
          </div>
          <div className="lab-fp-hero-content">
            <h2 className="lab-fp-hero-title">Recover Your Account</h2>
            <p className="lab-fp-hero-subtitle">
              Quick and secure password recovery to get you back to managing your workspace in no time.
            </p>
            <div className="lab-fp-hero-illustration">
              <div className="lab-fp-illustration-recovery">
                <div className="lab-fp-shield">
                  <div className="lab-fp-shield-inner">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                </div>
                <div className="lab-fp-key">
                  <div className="lab-fp-key-ring"></div>
                  <div className="lab-fp-key-bits"></div>
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
