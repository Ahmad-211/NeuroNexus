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
      <div className="lab-sp-container">
        <div className="lab-sp-loader-card">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading Account Details...</p>
        </div>
      </div>
    );
  }

  const hasAppealed = labData?.appealMessage && labData?.appealedAt;

  return (
    <div className="lab-sp-container">
      {alert.show && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={closeAlert}
        />
      )}
      <div className="lab-sp-wrapper">
        {/* Left Panel - Info & Appeal Form */}
        <div className="lab-sp-info-panel">
          <div className="lab-sp-info-header">
            <h2 className="lab-sp-title">Account Deactivated</h2>
            <p className="lab-sp-subtitle">Your lab portal access has been restricted by the administrator.</p>
          </div>

          <div className="lab-sp-content-scroll">
            <div className="lab-sp-reason-card">
              <h5>Reason for Deactivation</h5>
              <p className="mb-0">{labData?.adminReason || 'No specific reason provided.'}</p>
            </div>

            {adminEmail && (
              <div className="lab-sp-admin-contact">
                <i className="bi bi-envelope-fill me-2 text-secondary"></i>
                <span>
                  Admin Contact: <strong>{adminEmail}</strong>
                </span>
              </div>
            )}

            {hasAppealed ? (
              <div className="lab-sp-appeal-status">
                <i className="bi bi-shield-fill-exclamation me-3 text-warning fs-4"></i>
                <div>
                  <h5>Appeal Under Review</h5>
                  <p className="mb-0">Your request has been sent to the administrator. Please wait for them to re-activate your account.</p>
                </div>
              </div>
            ) : (
              <div className="lab-sp-appeal-form">
                <label htmlFor="appealText" className="lab-sp-form-label">
                  Submit an Appeal
                </label>
                <textarea
                  id="appealText"
                  className="form-control lab-sp-textarea"
                  rows="3"
                  placeholder="Provide an explanation to request reactivation..."
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  maxLength={1000}
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">{appealText.length}/1000</small>
                  <button
                    className="btn btn-danger lab-sp-btn-submit"
                    onClick={handleSubmitAppeal}
                    disabled={submitting || !appealText.trim()}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Appeal
                        <i className="bi bi-send ms-2"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lab-sp-footer">
            <button className="btn btn-outline-secondary lab-sp-btn-logout w-100" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>

        {/* Right Panel - Hero Illustration */}
        <div className="lab-sp-hero-panel">
          <div className="lab-sp-hero-decoration">
            <div className="lab-sp-hero-circle lab-sp-hero-circle-1"></div>
            <div className="lab-sp-hero-circle lab-sp-hero-circle-2"></div>
          </div>
          <div className="lab-sp-hero-content">
            <h2 className="lab-sp-hero-title">Access Restricted</h2>
            <p className="lab-sp-hero-subtitle">
              NeuroNexus security protocols have temporarily locked this workspace.
            </p>
            <div className="lab-sp-hero-illustration">
              <div className="lab-sp-illustration-recovery">
                <div className="lab-sp-shield-alert">
                  <div className="lab-sp-shield-alert-inner">
                    <i className="bi bi-shield-fill-x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuspendedPage;
