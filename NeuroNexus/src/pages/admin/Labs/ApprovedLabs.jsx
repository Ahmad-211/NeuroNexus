import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './ApprovedLabs.css';

function ApprovedLabs() {
  const navigate = useNavigate();
  const { database } = useFirebase();
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  
  const itemsPerPage = 10;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    fetchApprovedLabs();
  }, []);

  const fetchApprovedLabs = async () => {
    try {
      const { ref, get } = await import('firebase/database');
      const labsRef = ref(database, 'labs');
      const snapshot = await get(labsRef);
      
      if (snapshot.exists()) {
        const labsData = snapshot.val();
        const approvedLabs = Object.entries(labsData)
          .filter(([uid, lab]) => lab.registrationStatus === 'approved')
          .map(([uid, lab]) => ({ ...lab, id: uid, uid: uid }));
        setLabs(approvedLabs);
      } else {
        setLabs([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching approved labs:', error);
      setLoading(false);
    }
  };

  const handleDeactivate = (lab) => {
    setSelectedLab(lab);
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!deactivateReason.trim()) {
      showWarning('Required!', 'Please provide a reason for deactivation.');
      return;
    }

    try {
      // TODO: Implement Firebase deactivation logic
      /*
      import { getFirestore, doc, updateDoc } from 'firebase/firestore';
      const db = getFirestore();
      
      await updateDoc(doc(db, 'labs', selectedLab.id), {
        status: 'inactive',
        deactivationReason: deactivateReason,
        deactivatedDate: new Date().toISOString(),
        deactivatedBy: currentAdminId
      });
      
      // Send notification email
      // await sendDeactivationEmail(selectedLab.email, deactivateReason);
      */

      console.log('Deactivating lab:', selectedLab.id, 'Reason:', deactivateReason);
      
      setLabs(labs.map(lab => 
        lab.id === selectedLab.id 
          ? { ...lab, status: 'inactive' }
          : lab
      ));
      
      setShowDeactivateModal(false);
      setSelectedLab(null);
      setDeactivateReason('');
      showSuccess('Success!', 'Lab deactivated successfully.');
    } catch (error) {
      console.error('Error deactivating lab:', error);
      showError('Error!', 'Failed to deactivate lab. Please try again.');
    }
  };

  const handleActivate = async (lab) => {
    if (window.confirm(`Are you sure you want to activate ${lab.name}?`)) {
      try {
        // TODO: Implement Firebase activation logic
        /*
        import { getFirestore, doc, updateDoc } from 'firebase/firestore';
        const db = getFirestore();
        
        await updateDoc(doc(db, 'labs', lab.id), {
          status: 'active',
          reactivatedDate: new Date().toISOString(),
          reactivatedBy: currentAdminId
        });
        */

        console.log('Activating lab:', lab.id);
        
        setLabs(labs.map(l => 
          l.id === lab.id 
            ? { ...l, status: 'active' }
            : l
        ));
        
        showSuccess('Success!', 'Lab activated successfully.');
      } catch (error) {
        console.error('Error activating lab:', error);
        showError('Error!', 'Failed to activate lab. Please try again.');
      }
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

  // Statistics
  const stats = {
    total: labs.length,
    active: labs.length,
    inactive: 0
  };

  return (
    <div className="admin-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <main className="main-content">
        <div className="page-container">
          {/* Tab Navigation */}
          <div className="labs-tabs-nav">
            <button 
              className="labs-tab-btn"
              onClick={() => navigate('/labs/pending')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Pending Labs
            </button>
            <button className="labs-tab-btn active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Approved Labs
            </button>
          </div>

          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Approved Laboratories</h1>
              <p className="page-subtitle">
                Manage all approved and active laboratories in the system
              </p>
            </div>
            <div className="page-header-stats">
              <div className="stat-badge total">
                <span className="stat-badge-value">{stats.total}</span>
                <span className="stat-badge-label">Total</span>
              </div>
              <div className="stat-badge active">
                <span className="stat-badge-value">{stats.active}</span>
                <span className="stat-badge-label">Active</span>
              </div>
              <div className="stat-badge inactive">
                <span className="stat-badge-value">{stats.inactive}</span>
                <span className="stat-badge-label">Inactive</span>
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

            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading laboratories...</p>
              </div>
            ) : paginatedLabs.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M18 21H6M6 9h12M6 9V3h12v6M6 9l3 12m9-12l-3 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>No Labs Found</h3>
                <p>No laboratories match your current filters.</p>
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
                      <th>Status</th>
                      <th>Bookings</th>
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
                        <td>
                          <span className="badge badge-success">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Active
                          </span>
                        </td>
                        <td>
                          <span className="cell-main">{lab.labTiming || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-view"
                              onClick={() => viewDetails(lab.id)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {lab.status === 'active' ? (
                              <button
                                className="btn-icon btn-deactivate"
                                onClick={() => handleDeactivate(lab)}
                                title="Deactivate Lab"
                              >
                                <i className="bi bi-pause-circle"></i>
                              </button>
                            ) : (
                              <button
                                className="btn-icon btn-activate"
                                onClick={() => handleActivate(lab)}
                                title="Activate Lab"
                              >
                                <i className="bi bi-play-circle"></i>
                              </button>
                            )}
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

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Deactivate Laboratory</h2>
              <button
                className="modal-close"
                onClick={() => setShowDeactivateModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon danger">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="modal-text">
                Deactivate <strong>{selectedLab?.name}</strong>?
              </p>
              <p className="modal-subtext">
                This lab will not be able to accept new bookings while inactive.
              </p>
              <div className="form-group">
                <label className="form-label">Reason for Deactivation *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Please provide a detailed reason for deactivation..."
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={confirmDeactivate}
              >
                Deactivate Lab
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

export default ApprovedLabs;