import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../../../context/Firebase';

function LabAppealAlerts() {
  const { database, reactivateLab, dismissLabAppeal } = useFirebase();
  const [appeals, setAppeals] = useState([]);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    const loadAppeals = async () => {
      const { ref, get } = await import('firebase/database');
      const snap = await get(ref(database, 'labs'));
      if (snap.exists()) {
        const data = snap.val();
        const entries = Object.entries(data)
          .filter(([uid, lab]) => lab.appealMessage && lab.status === 'deactivated')
          .map(([uid, lab]) => ({ ...lab, id: uid, uid }))
          .sort((a, b) => (b.appealedAt || 0) - (a.appealedAt || 0));
        setAppeals(entries);
      }
    };

    loadAppeals();
    const interval = setInterval(loadAppeals, 10000);
    return () => clearInterval(interval);
  }, [database]);

  const handleReactivate = useCallback(async (lab) => {
    if (!window.confirm(`Reactivate ${lab.name || lab.labName || 'this lab'}? Their account will be restored.`)) return;
    setActionId(`reactivate-${lab.uid}`);
    const result = await reactivateLab(lab.uid);
    if (result.success) {
      setAppeals(prev => prev.filter(a => a.uid !== lab.uid));
    }
    setActionId(null);
  }, [reactivateLab]);

  const handleDismiss = useCallback(async (lab) => {
    if (!window.confirm(`Dismiss ${lab.name || lab.labName || 'this lab'}'s appeal? The lab will remain deactivated.`)) return;
    setActionId(`dismiss-${lab.uid}`);
    const result = await dismissLabAppeal(lab.uid);
    if (result.success) {
      setAppeals(prev => prev.filter(a => a.uid !== lab.uid));
    }
    setActionId(null);
  }, [dismissLabAppeal]);

  if (appeals.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <h5 className="mb-0 fw-bold">Lab Appeal Requests</h5>
        <span className="badge bg-danger">{appeals.length} pending</span>
      </div>

      {appeals.map(lab => (
        <div
          key={lab.uid}
          className="alert alert-warning border-0 shadow-sm d-flex align-items-start gap-3 mb-2"
          style={{ borderRadius: '10px' }}
        >
          <div className="flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#856404" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="flex-grow-1">
            <strong className="text-dark">{lab.name || lab.labName || 'Unknown Lab'}</strong>
            <span className="text-muted mx-1">appealed their deactivation:</span>
            <p className="mb-1 mt-1" style={{ fontSize: '13px', color: '#495057' }}>
              "{lab.appealMessage}"
            </p>
            <small className="text-muted">
              {lab.appealedAt ? new Date(lab.appealedAt).toLocaleString() : ''}
            </small>
          </div>
          <div className="flex-shrink-0 d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => handleDismiss(lab)}
              disabled={actionId === `dismiss-${lab.uid}`}
            >
              {actionId === `dismiss-${lab.uid}` ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                'Dismiss'
              )}
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleReactivate(lab)}
              disabled={actionId === `reactivate-${lab.uid}`}
            >
              {actionId === `reactivate-${lab.uid}` ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                'Reactivate'
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LabAppealAlerts;
