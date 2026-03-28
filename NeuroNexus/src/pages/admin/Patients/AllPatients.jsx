import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './AllPatients.css';

function AllPatients() {
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const { getAllPatients, togglePatientStatus } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch patients from Firebase
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllPatients();
        if (result.success) {
          setPatients(result.patients);
        } else {
          setError(result.error || 'Failed to fetch patients');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleToggleStatus = async (patientUid, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setTogglingId(patientUid);
    try {
      const result = await togglePatientStatus(patientUid, newStatus);
      if (result.success) {
        setPatients(patients.map(p =>
          p.uid === patientUid ? { ...p, status: newStatus } : p
        ));
        showSuccess('Success!', `Patient ${newStatus === 'active' ? 'activated' : 'blocked'} successfully!`);
      } else {
        showError('Error', result.error || 'Failed to update status');
      }
    } catch (err) {
      showError('Error', err.message);
    } finally {
      setTogglingId(null);
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = (patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalPatients = patients.length;
  const activeCount = patients.filter(p => p.status === 'active').length;
  const blockedCount = patients.filter(p => p.status === 'blocked').length;

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="All Patients" />

        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="mb-1 fw-bold">All Patients</h2>
                <p className="text-muted mb-0">Manage registered patients in the system</p>
              </div>
            </div>

            {/* Stats Cards - 3 cards evenly spaced */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Patients</p>
                      <h4 className="mb-0 fw-bold">{totalPatients}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-people text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Active Patients</p>
                      <h4 className="mb-0 fw-bold text-success">{activeCount}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-person-check text-success" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Blocked Patients</p>
                      <h4 className="mb-0 fw-bold text-danger">{blockedCount}</h4>
                    </div>
                    <div className="icon-bg bg-danger bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-person-x text-danger" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-center">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="blocked">Blocked Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mb-0">Loading patients...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Patients Table */}
            {!loading && !error && (
              filteredPatients.length === 0 ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '48px' }}></i>
                    <h5 className="mt-3 text-muted">No patients found</h5>
                    <p className="text-muted">Try adjusting your search or filters.</p>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">Patient ID</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3 text-center">Total Bookings</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPatients.map(patient => (
                            <tr key={patient.uid}>
                              <td className="px-4 py-3">
                                <code className="text-primary fw-semibold">{patient.uid}</code>
                              </td>
                              <td className="px-4 py-3">
                                <div className="fw-semibold">{patient.name}</div>
                              </td>
                              <td className="px-4 py-3">
                                <small>{patient.phone}</small>
                              </td>
                              <td className="px-4 py-3">
                                <small>{patient.email}</small>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <strong>{patient.totalBookings}</strong>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`badge ${patient.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                  {patient.status === 'active' ? 'Active' : 'Blocked'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="d-flex gap-2 justify-content-center">
                                  <button
                                    className={`btn btn-sm ${patient.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                    onClick={() => handleToggleStatus(patient.uid, patient.status)}
                                    disabled={togglingId === patient.uid}
                                    title={patient.status === 'active' ? 'Block Patient' : 'Activate Patient'}
                                  >
                                    {togglingId === patient.uid ? (
                                      <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                      <>
                                        <i className={`bi ${patient.status === 'active' ? 'bi-person-x me-1' : 'bi-person-check me-1'}`}></i>
                                        {patient.status === 'active' ? 'Block' : 'Activate'}
                                      </>
                                    )}
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
              )
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

export default AllPatients;
