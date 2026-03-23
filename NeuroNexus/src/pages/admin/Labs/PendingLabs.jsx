import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './PendingLabs.css';

function PendingLabs() {
  const navigate = useNavigate();
  const { database, approveLab, rejectLab } = useFirebase();
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const itemsPerPage = 10;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    fetchPendingLabs();
  }, []);

  const fetchPendingLabs = async () => {
    try {
      const { ref, get } = await import('firebase/database');
      const labsRef = ref(database, 'labs');
      const snapshot = await get(labsRef);
      
      if (snapshot.exists()) {
        const labsData = snapshot.val();
        const pendingLabs = Object.entries(labsData)
          .filter(([uid, lab]) => lab.registrationStatus === 'pending')
          .map(([uid, lab]) => ({ ...lab, id: uid, uid: uid }));
        setLabs(pendingLabs);
      } else {
        setLabs([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending labs:', error);
      setLoading(false);
    }
  };

  const handleApprove = (lab) => {
    setSelectedLab(lab);
    setShowApproveModal(true);
  };

  const handleReject = (lab) => {
    setSelectedLab(lab);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    try {
      const result = await approveLab(selectedLab.uid);
      
      if (result.success) {
        console.log('Lab approved:', selectedLab.uid);
        setLabs(labs.filter(lab => lab.uid !== selectedLab.uid));
        setShowApproveModal(false);
        setSelectedLab(null);
        showSuccess('Success!', 'Lab approved successfully!');
      } else {
        showError('Error!', 'Failed to approve lab. Please try again.');
      }
    } catch (error) {
      console.error('Error approving lab:', error);
      showError('Error!', 'Failed to approve lab. Please try again.');
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      showWarning('Required!', 'Please provide a reason for rejection.');
      return;
    }

    try {
      const result = await rejectLab(selectedLab.uid);
      
      if (result.success) {
        console.log('Lab rejected:', selectedLab.uid, 'Reason:', rejectReason);
        setLabs(labs.filter(lab => lab.uid !== selectedLab.uid));
        setShowRejectModal(false);
        setSelectedLab(null);
        setRejectReason('');
        showSuccess('Success!', 'Lab registration rejected and removed from database.');
      } else {
        showError('Error!', 'Failed to reject lab. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting lab:', error);
      showError('Error!', 'Failed to reject lab. Please try again.');
    }
  };

  const viewDetails = (labId) => {
    navigate(`/labs/${labId}`);
  };

  // Filter and search logic
  const filteredLabs = labs.filter(lab => {
    const matchesSearch = 
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.city && lab.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = filterLocation === 'all' || lab.city === filterLocation;
    
    return matchesSearch && matchesLocation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLabs = filteredLabs.slice(startIndex, startIndex + itemsPerPage);

  // Get unique locations for filter
  const locations = ['all', ...new Set(labs.map(lab => lab.city).filter(Boolean))];

  return (
    <div className="admin-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <main className="main-content">
        <div className="page-container">
          {/* Tab Navigation */}
          <div className="labs-tabs-nav">
            <button className="labs-tab-btn active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Pending Labs
            </button>
            <button 
              className="labs-tab-btn"
              onClick={() => navigate('/labs/approved')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Approved Labs
            </button>
          </div>

          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Pending Lab Registrations</h1>
              <p className="page-subtitle">
                Review and approve laboratory registration requests
              </p>
            </div>
            <div className="page-header-stats">
              <div className="stat-badge pending">
                <span className="stat-badge-value">{labs.length}</span>
                <span className="stat-badge-label">Pending</span>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="filters-section">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name, license, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Location:</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="filter-select"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading pending labs...</p>
              </div>
            ) : paginatedLabs.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M18 21H6M6 9h12M6 9V3h12v6M6 9l3 12m9-12l-3 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>No Pending Labs</h3>
                <p>There are no laboratory registrations awaiting approval.</p>
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Lab Name</th>
                      <th>License Number</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Registered Date</th>
                      <th>Documents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLabs.map((lab) => (
                      <tr key={lab.id}>
                        <td>
                          <div className="cell-with-subtitle">
                            <span className="cell-main">{lab.name}</span>
                            <span className="cell-sub">{lab.id}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-neutral">{lab.licenseNumber}</span>
                        </td>
                        <td>
                          <div className="cell-with-subtitle">
                            <span className="cell-main">{lab.phone}</span>
                            <span className="cell-sub">{lab.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-with-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{lab.city || 'N/A'}</span>
                          </div>
                        </td>
                        <td>{lab.createdAt ? new Date(lab.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {lab.licenseImageUrl ? (
                            <span className="badge badge-success">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Complete
                            </span>
                          ) : (
                            <span className="badge badge-warning">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Incomplete
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {lab.licenseImageUrl && (
                              <button
                                className="btn-icon btn-view"
                                onClick={() => window.open(lab.licenseImageUrl, '_blank')}
                                title="View License"
                              >
                                <i className="bi bi-file-text"></i>
                              </button>
                            )}
                            <button
                              className="btn-icon btn-approve"
                              onClick={() => handleApprove(lab)}
                              title="Approve Lab"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                            <button
                              className="btn-icon btn-reject"
                              onClick={() => handleReject(lab)}
                              title="Reject Lab"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Previous
                    </button>
                    
                    <div className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Approve Lab Registration</h2>
              <button
                className="modal-close"
                onClick={() => setShowApproveModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="modal-text">
                Are you sure you want to approve <strong>{selectedLab?.name}</strong>?
              </p>
              <p className="modal-subtext">
                This lab will be activated and can start accepting bookings.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-success"
                onClick={confirmApprove}
              >
                Approve Lab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reject Lab Registration</h2>
              <button
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon danger">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="modal-text">
                Reject registration for <strong>{selectedLab?.name}</strong>
              </p>
              <div className="form-group">
                <label className="form-label">Reason for Rejection *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Please provide a detailed reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={confirmReject}
              >
                Reject Lab
              </button>
            </div>
          </div>
        </div>
      )}

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

export default PendingLabs;