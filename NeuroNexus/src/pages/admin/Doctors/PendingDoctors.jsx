import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './PendingDoctors.css';

function PendingDoctors() {
  const navigate = useNavigate();
  const { getAllDoctors, approveDoctor, rejectDoctor, loading } = useFirebase();
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      fetchPendingDoctors();
    }
  }, [loading]);

  const fetchPendingDoctors = async () => {
    setIsLoading(true);
    try {
      const result = await getAllDoctors();
      if (result.success) {
        const pending = result.doctors.filter(
          doc => doc.registrationStatus === 'pending'
        );
        setPendingDoctors(pending);
      }
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const viewLicense = (doctor) => {
    setSelectedDoctor(doctor);
    setShowLicenseModal(true);
  };

  const handleApprove = async (doctorId) => {
    if (window.confirm('Are you sure you want to approve this doctor?')) {
      const result = await approveDoctor(doctorId);
      if (result.success) {
        showSuccess('Success!', 'Doctor approved successfully!');
        fetchPendingDoctors();
      } else {
        showError('Error!', 'Failed to approve doctor: ' + result.error);
      }
    }
  };

  const handleReject = async (doctorId) => {
    if (window.confirm('Are you sure you want to reject this doctor?')) {
      const result = await rejectDoctor(doctorId);
      if (result.success) {
        showSuccess('Success!', 'Doctor rejected successfully!');
        fetchPendingDoctors();
      } else {
        showError('Error!', 'Failed to reject doctor: ' + result.error);
      }
    }
  };

  // Get unique specializations for filter
  const specializations = ['all', ...new Set(pendingDoctors.map(doc => doc.specialization))];

  // Filter doctors based on search and specialization
  const filteredDoctors = pendingDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                  doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  if (isLoading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} pageTitle="Pending Doctors" />
          <div className="flex-grow-1 overflow-y-auto">
            <div className="w-100 p-4">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading pending doctors...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Pending Doctors" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">Pending Doctor Registrations</h2>
                <p className="text-muted mb-0">Review and approve doctor applications</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button 
                  className="btn btn-primary me-2"
                  onClick={() => navigate('/doctors/approved')}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  View Approved Doctors
                </button>
                <span className="badge bg-warning text-dark fs-6">
                  {pendingDoctors.length} Pending Approvals
                </span>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by name or license number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                    >
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>
                          {spec === 'all' ? 'All Specializations' : spec}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-outline-secondary w-100">
                      <i className="bi bi-funnel me-1"></i> Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctors Table */}
            {filteredDoctors.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{fontSize: '48px'}}></i>
                  <h5 className="mt-3 text-muted">No pending doctors found</h5>
                  <p className="text-muted">All doctor registrations have been reviewed.</p>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3">Doctor Info</th>
                          <th className="px-4 py-3">Specialization</th>
                          <th className="px-4 py-3">License Number</th>
                          <th className="px-4 py-3">Qualification</th>
                          <th className="px-4 py-3">Consultation Fee</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDoctors.map(doctor => (
                          <tr key={doctor.id}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle bg-primary bg-opacity-10 text-primary me-3">
                                  <i className="bi bi-person-circle"></i>
                                </div>
                                <div>
                                  <div className="fw-semibold">{doctor.name}</div>
                                  <small className="text-muted">{doctor.email}</small>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="badge bg-info bg-opacity-10 text-info">
                                {doctor.specialization}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <code className="text-dark">{doctor.licenseNumber}</code>
                            </td>
                            <td className="px-4 py-3">
                              <small>{doctor.qualification}</small>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-success fw-semibold">₹{doctor.consultationFee}</span>
                            </td>
                            <td className="px-4 py-3">
                              <small>{doctor.phone}</small>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  className="btn btn-outline-info btn-sm"
                                  onClick={() => viewLicense(doctor)}
                                  title="View License"
                                >
                                  <i className="bi bi-file-earmark-image"></i>
                                </button>
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleApprove(doctor.id)}
                                  title="Approve Doctor"
                                >
                                  <i className="bi bi-check-circle"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleReject(doctor.id)}
                                  title="Reject Doctor"
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* License View Modal */}
            {showLicenseModal && selectedDoctor && (
              <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">License - {selectedDoctor.name}</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowLicenseModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body text-center">
                      {selectedDoctor.licenseImageUrl ? (
                        <img 
                          src={selectedDoctor.licenseImageUrl} 
                          alt="License" 
                          className="img-fluid rounded"
                          style={{maxHeight: '70vh'}}
                        />
                      ) : (
                        <div className="py-5">
                          <i className="bi bi-file-earmark-x text-muted" style={{fontSize: '48px'}}></i>
                          <p className="mt-3 text-muted">No license image uploaded</p>
                        </div>
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
                      <button 
                        type="button" 
                        className="btn btn-success" 
                        onClick={() => {
                          setShowLicenseModal(false);
                          handleApprove(selectedDoctor.id);
                        }}
                      >
                        Approve Doctor
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => {
                          setShowLicenseModal(false);
                          handleReject(selectedDoctor.id);
                        }}
                      >
                        Reject Doctor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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

export default PendingDoctors;