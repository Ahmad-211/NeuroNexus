import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgetPassword.css';

function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement backend logic here
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    navigate('/lab/login');
  };

  if (isSubmitted) {
    return (
      <div className="forget-password-page lab-theme">
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
    <div className="forget-password-page lab-theme">
      <div className="forget-password-container">
        <div className="forget-password-icon">
          <i className="bi bi-shield-lock-fill"></i>
        </div>
        <h2 className="forget-password-title">Forgot Password?</h2>
        <p className="forget-password-subtitle">
          No worries! Enter your registered email address and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="forget-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <i className="bi bi-envelope"></i>
              <input
                type="email"
                id="email"
                placeholder="lab@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-reset-password">
            Send Reset Link
            <i className="bi bi-send ms-2"></i>
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
