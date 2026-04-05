import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './ApprovedDoctors.css';

function ApprovedDoctors() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const navigate = useNavigate();
  const { getAllDoctors, getDoctorCategories, loading } = useFirebase();

  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [loading]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docResult, catResult] = await Promise.all([
        getAllDoctors(),
        getDoctorCategories()
      ]);

      if (docResult.success) {
        const approved = docResult.doctors.filter(
          doc => doc.registrationStatus === 'approved'
        );
        setDoctors(approved);
      }

      if (catResult.success) {
        setCategories(catResult.categories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleViewDetails = (doctorId) => {
    navigate(`/admin/doctors/${doctorId}`);
  };

  // Get specializations from Firebase categories, adding 'all' option
  const specializations = ['all', ...categories.map(c => c.name)];

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
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
        <div className="flex-grow-1 overflow-y-auto">
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="w-100 p-4">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading approved doctors...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = doctors.filter(d => d.status === 'active').length;
  const inactiveCount = doctors.filter(d => d.status === 'inactive').length;

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Approved Doctors" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">Approved Doctors</h2>
                <p className="text-muted mb-0">Manage active doctors in the system</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button 
                  className="btn btn-outline-primary me-2"
                  onClick={() => navigate('/doctors/pending')}
                >
                  <i className="bi bi-clock-history me-2"></i>
                  View Pending Doctors
                </button>
                <span className="badge bg-success me-2">{activeCount} Active</span>
                <span className="badge bg-secondary">{inactiveCount} Inactive</span>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-center">
                  <div className="col-md-5">
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
                  <div className="col-md-3">
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
                  <div className="col-md-4 text-end">
                    <div className="btn-group" role="group">
                      <button
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('table')}
                      >
                        <i className="bi bi-table"></i>
                      </button>
                      <button
                        className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('card')}
                      >
                        <i className="bi bi-grid-3x3-gap"></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-manage-categories ms-2"
                      onClick={() => navigate('/doctors/categories')}
                    >
                      <i className="bi bi-tags me-1"></i> Manage Categories
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctors Display */}
            {filteredDoctors.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{fontSize: '48px'}}></i>
                  <h5 className="mt-3 text-muted">No doctors found</h5>
                  <p className="text-muted">Try adjusting your search or filters.</p>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              // Table View
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
                                {doctor.profileImageUrl ? (
                                  <img 
                                    src={doctor.profileImageUrl} 
                                    alt={doctor.name}
                                    className="rounded-circle me-3"
                                    style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                  />
                                ) : (
                                  <div className="avatar-circle bg-primary bg-opacity-10 text-primary me-3">
                                    <i className="bi bi-person-circle"></i>
                                  </div>
                                )}
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
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => viewLicense(doctor)}
                                  title="View License"
                                >
                                  <i className="bi bi-file-earmark-image"></i>
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
            ) : (
              // Card View
              <div className="row g-4">
                {filteredDoctors.map(doctor => (
                  <div key={doctor.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm doctor-card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          {doctor.profileImageUrl ? (
                            <img 
                              src={doctor.profileImageUrl} 
                              alt={doctor.name}
                              className="rounded-circle"
                              style={{width: '60px', height: '60px', objectFit: 'cover'}}
                            />
                          ) : (
                            <div className="avatar-circle-large bg-primary bg-opacity-10 text-primary">
                              <i className="bi bi-person-circle"></i>
                            </div>
                          )}
                          <span className="badge bg-success">Approved</span>
                        </div>
                        <h5 className="fw-bold mb-1">{doctor.name}</h5>
                        <p className="text-muted small mb-2">{doctor.specialization}</p>
                        <p className="text-muted small mb-3">
                          <code>{doctor.licenseNumber}</code>
                        </p>
                        
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-mortarboard text-primary me-2"></i>
                            <small>{doctor.qualification}</small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-cash text-success me-2"></i>
                            <small className="fw-semibold">Fee: ₹{doctor.consultationFee}</small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-telephone text-info me-2"></i>
                            <small>{doctor.phone}</small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-envelope text-secondary me-2"></i>
                            <small>{doctor.email}</small>
                          </div>
                          {doctor.clinicAddress && (
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-geo-alt text-danger me-2"></i>
                              <small>{doctor.clinicAddress}</small>
                            </div>
                          )}
                          {doctor.schedule && (
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-clock text-warning me-2"></i>
                              <small>{doctor.schedule}</small>
                            </div>
                          )}
                          {doctor.rating && (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-star-fill text-warning me-2"></i>
                              <small>Rating: {doctor.rating}/5</small>
                            </div>
                          )}
                        </div>
                        
                        <div className="d-grid">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => viewLicense(doctor)}
                          >
                            <i className="bi bi-file-earmark-image me-1"></i>
                            View License
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovedDoctors;