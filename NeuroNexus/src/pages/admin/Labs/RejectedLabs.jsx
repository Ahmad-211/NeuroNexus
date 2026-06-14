import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './RejectedLabs.css';

function RejectedLabs() {
  const navigate = useNavigate();
  const { database, approveLab } = useFirebase();
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [approvingId, setApprovingId] = useState(null);

  const itemsPerPage = 10;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    fetchRejectedLabs();
  }, []);

  const fetchRejectedLabs = async () => {
    try {
      const { ref, get } = await import('firebase/database');
      const labsRef = ref(database, 'labs');
      const snapshot = await get(labsRef);

      if (snapshot.exists()) {
        const labsData = snapshot.val();
        const rejectedLabs = Object.entries(labsData)
          .filter(([uid, lab]) => lab.registrationStatus === 'rejected')
          .map(([uid, lab]) => ({ ...lab, id: uid, uid: uid }));
        setLabs(rejectedLabs);
      } else {
        setLabs([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rejected labs:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (labUid) => {
    if (!window.confirm('Are you sure you want to approve this previously rejected lab?')) return;

    setApprovingId(labUid);
    try {
      const result = await approveLab(labUid);
      if (result.success) {
        showSuccess('Success!', 'Lab approved successfully!');
        setLabs(labs.filter(l => l.uid !== labUid));
      } else {
        showError('Error!', result.error || 'Failed to approve lab.');
      }
    } catch (error) {
      showError('Error!', 'Failed to approve lab.');
    } finally {
      setApprovingId(null);
    }
  };

  const filteredLabs = labs.filter(lab => {
    const matchesSearch =
      (lab.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.licenseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || lab.city === filterLocation;
    return matchesSearch && matchesLocation;
  });

  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLabs = filteredLabs.slice(startIndex, startIndex + itemsPerPage);
  const locations = ['all', ...new Set(labs.map(lab => lab.city).filter(Boolean))];

  return (
    <div className="admin-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      <main className="main-content">
        <div className="page-container">
          <div className="labs-tabs-nav">
            <button className="labs-tab-btn" onClick={() => navigate('/labs/pending')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Pending Labs
            </button>
            <button className="labs-tab-btn" onClick={() => navigate('/labs/approved')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Approved Labs
            </button>
            <button className="labs-tab-btn active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 6h12v12H6z" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 10l4 4M14 10l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Rejected Labs
            </button>
          </div>

          <div className="page-header">
            <div>
              <h1 className="page-title">Rejected Laboratories</h1>
              <p className="page-subtitle">View and manage previously rejected lab registrations</p>
            </div>
            <div className="page-header-stats">
              <div className="stat-badge total">
                <span className="stat-badge-value">{labs.length}</span>
                <span className="stat-badge-label">Total Rejected</span>
              </div>
            </div>
          </div>

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
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="filter-select">
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading rejected labs...</p>
              </div>
            ) : paginatedLabs.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M18 21H6M6 9h12M6 9V3h12v6M6 9l3 12m9-12l-3 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>No Rejected Labs</h3>
                <p>No laboratories have been rejected yet.</p>
              </div>
            ) : (
              <>
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">Lab Info</th>
                            <th className="px-4 py-3">City</th>
                            <th className="px-4 py-3">License Number</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Rejected At</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedLabs.map((lab) => (
                            <tr key={lab.id}>
                              <td className="px-4 py-3">
                                <div className="d-flex align-items-center">
                                  {lab.profilePicUrl ? (
                                    <img src={lab.profilePicUrl} alt={lab.name} className="rounded-circle me-3" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                                  ) : (
                                    <div className="lab-avatar-circle me-3">
                                      <i className="bi bi-building"></i>
                                    </div>
                                  )}
                                  <div>
                                    <div className="fw-semibold">{lab.name}</div>
                                    <small className="text-muted">{lab.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="badge bg-info bg-opacity-10 text-info">{lab.city || 'N/A'}</span>
                              </td>
                              <td className="px-4 py-3"><code className="text-dark">{lab.licenseNumber}</code></td>
                              <td className="px-4 py-3"><small>{lab.phone}</small></td>
                              <td className="px-4 py-3">
                                <small className="text-danger">
                                  {lab.rejectedAt ? new Date(lab.rejectedAt).toLocaleDateString() : 'N/A'}
                                </small>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleApprove(lab.uid)}
                                  disabled={approvingId === lab.uid}
                                  title="Approve Lab"
                                >
                                  {approvingId === lab.uid ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <><i className="bi bi-check-circle me-1"></i> Approve</>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Previous
                    </button>
                    <div className="pagination-info">Page {currentPage} of {totalPages}</div>
                    <button className="pagination-btn" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
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

      <Alert type={alert.type} title={alert.title} message={alert.message} isOpen={alert.isOpen} onClose={closeAlert} />
    </div>
  );
}

export default RejectedLabs;