import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './SuspendedPage.css';

function SuspendedPage() {
  const { currentUser, database, submitLabAppeal, logout } = useFirebase();
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const navigate = useNavigate();
  const [labData, setLabData] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [appealText, setAppealText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const { ref, get } = await import('firebase/database');

      const [labSnap, usersSnap] = await Promise.all([
        get(ref(database, `labs/${currentUser.uid}`)),
        get(ref(database, 'users'))
      ]);

      if (labSnap.exists()) {
        setLabData(labSnap.val());
      }

      if (usersSnap.exists()) {
        const users = usersSnap.val();
        const adminEntry = Object.entries(users).find(([_, u]) => u.role === 'admin');
        if (adminEntry) {
          const adminSnap = await get(ref(database, `admin/${adminEntry[0]}`));
          if (adminSnap.exists()) {
            setAdminEmail(adminSnap.val().email || '');
          } else {
            setAdminEmail(adminEntry[1].email || '');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!appealText.trim()) return;
    setSubmitting(true);
    const result = await submitLabAppeal(currentUser.uid, appealText.trim());
    if (result.success) {
      showSuccess('Appeal Submitted', 'Your appeal has been forwarded to the admin team. Please wait for review.');
      setAppealText('');
      setLabData(prev => ({ ...prev, appealMessage: appealText.trim(), appealedAt: Date.now() }));
    } else {
      showError('Error', result.error || 'Failed to submit appeal.');
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/lab/login');
  };

  if (loading) {
    return (
      <div className="suspended-page">
        <div className="suspended-container">
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasAppealed = labData?.appealMessage && labData?.appealedAt;

  return (
    <div className="suspended-page">
      <div className="suspended-container">
        <div className="suspended-card">
          <div className="suspended-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>

          <h2 className="suspended-title">Account Suspended</h2>

          <p className="suspended-subtitle">
            Your lab account has been deactivated by the administrator.
          </p>

          <div className="suspended-reason-card">
            <h5>Reason for Deactivation</h5>
            <p className="mb-0">{labData?.adminReason || 'No specific reason provided.'}</p>
          </div>

          {adminEmail && (
            <div className="admin-contact-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>
                For any queries, contact the admin at: <strong>{adminEmail}</strong>
              </span>
            </div>
          )}

          {hasAppealed ? (
            <div className="appeal-status-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffc107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <h5>Appeal Submitted</h5>
                <p className="mb-0">Your appeal has been forwarded to the admin team. Please wait for review.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="appeal-prompt">
                If you believe this was a mistake, you can submit an appeal below.
              </p>

              <div className="appeal-form">
                <label htmlFor="appealText" className="form-label fw-semibold">
                  Submit an Appeal
                </label>
                <textarea
                  id="appealText"
                  className="form-control"
                  rows="4"
                  placeholder="Explain why your account should be reactivated..."
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  maxLength={1000}
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">{appealText.length}/1000</small>
                  <button
                    className="btn btn-danger px-4"
                    onClick={handleSubmitAppeal}
                    disabled={submitting || !appealText.trim()}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Appeal'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="suspended-actions">
            <button className="btn btn-outline-secondary" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuspendedPage;
