import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './LabDetails.css';

function LabDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLabById, database } = useFirebase();
  const { alert, showSuccess, showInfo, closeAlert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  useEffect(() => {
    fetchLabDetails();
  }, [id]);

  const fetchLabDetails = async () => {
    setLoading(true);
    try {
      const result = await getLabById(id);
      
      if (result.success) {
        console.log('Lab UID:', id);
        console.log('Lab Data:', result.lab);
        setLab({ id: id, ...result.lab });
        // Fetch tests for this lab
        await fetchLabTests(id);
      } else {
        console.error('Failed to fetch lab:', result.error);
        setLab(null);
      }
    } catch (error) {
      console.error('Error fetching lab details:', error);
      setLab(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabTests = async (labUid) => {
    try {
      console.log('Fetching tests for lab UID:', labUid);
      const { ref, get } = await import('firebase/database');
      
      // First, let's fetch ALL tests to see the structure
      const allTestsRef = ref(database, 'tests');
      const allSnapshot = await get(allTestsRef);
      
      if (allSnapshot.exists()) {
        const allTestsData = allSnapshot.val();
        console.log('All Tests in Firebase:', allTestsData);
        
        // Filter tests by createdBy
        const filteredTests = Object.entries(allTestsData)
          .filter(([key, test]) => {
            console.log(`Test ${key} createdBy:`, test.createdBy, 'Matching against:', labUid, 'Match:', test.createdBy === labUid);
            return test.createdBy === labUid;
          })
          .map(([key, test]) => ({
            id: key,
            ...test
          }));
        
        console.log('Filtered Tests for this lab:', filteredTests);
        setLabTests(filteredTests);
      } else {
        console.log('No tests found in database');
        setLabTests([]);
      }
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setLabTests([]);
    }
  };

  const handleViewLicense = () => {
    if (lab?.licenseImageUrl) {
      setShowLicenseModal(true);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBack = () => {
    navigate('/labs/approved');
  };

  const handleApprove = () => {
    if (window.confirm(`Are you sure you want to approve ${lab.name}?`)) {
      // TODO: Implement Firebase approval
      showSuccess('Success!', 'Lab approved successfully!');
      navigate('/labs/approved');
    }
  };

  const handleReject = () => {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
      // TODO: Implement Firebase rejection
      showInfo('Rejected', 'Lab rejected.');
      navigate('/labs/pending');
    }
  };



  if (loading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="flex-grow-1 d-flex flex-column">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-grow-1 overflow-y-auto">
            <div className="w-100 p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="flex-grow-1 d-flex flex-column">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-grow-1 overflow-y-auto">
            <div className="w-100 p-4">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Lab not found
              </div>
              <button className="btn btn-primary" onClick={handleBack}>
                <i className="bi bi-arrow-left me-2"></i> Back to Labs
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4 lab-details-page">
            {/* Header */}
            <div className="page-header mb-4">
              <button className="btn btn-outline-secondary mb-3" onClick={handleBack}>
                <i className="bi bi-arrow-left me-2"></i> Back to Labs
              </button>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="lab-avatar-large">
                    {lab.profilePicUrl ? (
                      <img src={lab.profilePicUrl} alt={lab.name} className="lab-avatar-img" />
                    ) : (
                      <i className="bi bi-hospital"></i>
                    )}
                  </div>
                  <div>
                    <h2 className="page-title mb-2">
                      {lab.name}
                    </h2>
                    <p className="page-subtitle text-muted mb-2">
                      License: <span className="fw-semibold">{lab.licenseNumber}</span>
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {lab.registrationStatus === 'pending' && (
                    <>
                      <button className="btn btn-success" onClick={handleApprove}>
                        <i className="bi bi-check-circle me-2"></i> Approve
                      </button>
                      <button className="btn btn-danger" onClick={handleReject}>
                        <i className="bi bi-x-circle me-2"></i> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs mb-4">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-info-circle me-2"></i> Overview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                <i className="bi bi-list-check me-2"></i> Services
              </button>
              <button 
                className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <i className="bi bi-file-earmark-text me-2"></i> Documents
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                {/* Lab Information - Full Width */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white">
                    <h5 className="mb-0"><i className="bi bi-building me-2"></i>Lab Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="info-row">
                          <span className="info-label">Lab Name:</span>
                          <span className="info-value">{lab.name}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Total Tests Offered:</span>
                          <span className="info-value">{labTests.length}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-row">
                          <span className="info-label">License Number:</span>
                          <span className="info-value">{lab.licenseNumber}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Operating Hours:</span>
                          <span className="info-value">{lab.labTiming || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0"><i className="bi bi-telephone me-2"></i>Contact Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="info-row">
                          <span className="info-label">Email:</span>
                          <span className="info-value">{lab.email}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{lab.phone}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-row">
                          <span className="info-label">Location:</span>
                          <span className="info-value">{lab.city}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Address:</span>
                          <span className="info-value">{lab.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0"><i className="bi bi-list-check me-2"></i>Available Tests</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Test Name</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labTests && labTests.length > 0 ? (
                        labTests.map((test, index) => (
                          <tr key={test.id}>
                            <td>{index + 1}</td>
                            <td className="fw-semibold">{test.testName || test.name || 'N/A'}</td>
                            <td className="text-success fw-semibold">₹{test.price || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-4">
                            <i className="bi bi-inbox me-2"></i>No tests available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0"><i className="bi bi-file-earmark-text me-2"></i>License Certificate</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Document Name</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td className="fw-semibold">
                          <i className="bi bi-file-earmark-image text-primary me-2"></i>
                          License Certificate
                        </td>
                        <td>
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i> Verified
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleViewLicense}
                            disabled={!lab.licenseImageUrl}
                          >
                            <i className="bi bi-eye me-1"></i> View License Certificate
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* License Modal */}
      {showLicenseModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-image me-2"></i>
                  License Certificate - {lab.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowLicenseModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                {lab.licenseImageUrl ? (
                  <img 
                    src={lab.licenseImageUrl} 
                    alt="License Certificate" 
                    className="img-fluid rounded"
                    style={{ maxHeight: '70vh', objectFit: 'contain' }}
                  />
                ) : (
                  <p className="text-muted">No license image available</p>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowLicenseModal(false)}
                >
                  Close
                </button>
                {lab.licenseImageUrl && (
                  <a 
                    href={lab.licenseImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <i className="bi bi-box-arrow-up-right me-2"></i>
                    Open in New Tab
                  </a>
                )}
              </div>
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

export default LabDetails;
