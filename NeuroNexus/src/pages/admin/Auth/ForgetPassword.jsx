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

  if (isSubmitted) {
    return (
      <div className="forget-password-page">
        <div className="forget-password-container">
          <div className="success-animation">
            <div className="success-circle">
              <i className="bi bi-check-lg"></i>
            </div>
          </div>
          <h2 className="success-title">Check Your Email</h2>
          <p className="success-message">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <p className="success-note">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <button className="btn-back-login" onClick={handleBackToLogin}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forget-password-page">
      <div className="forget-password-container">
        <div className="forget-password-icon">
          <i className="bi bi-lock-fill"></i>
        </div>
        <h2 className="forget-password-title">Forgot Password?</h2>
        <p className="forget-password-subtitle">
          No worries! Enter your email address and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="forget-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <i className="bi bi-envelope"></i>
              <input
                type="email"
                id="email"
                placeholder="admin@neuronexus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 mb-3" style={{fontSize: '14px', borderRadius: '10px'}}>
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          <button type="submit" className="btn-reset-password" disabled={loading}>
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

        <div className="back-to-login">
          <button onClick={handleBackToLogin} className="link-button">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
