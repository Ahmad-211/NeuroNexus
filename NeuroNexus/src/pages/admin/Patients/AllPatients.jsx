import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './AllPatients.css';

function AllPatients() {
  const { alert, showSuccess, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mock patients data
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      phone: '+91 98765 11111',
      age: 34,
      gender: 'Male',
      bloodGroup: 'A+',
      address: 'Mumbai, Maharashtra',
      registeredDate: '2024-01-10',
      lastVisit: '2024-01-20',
      status: 'active',
      totalBookings: 12,
      totalSpent: '₹8,500'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91 98765 22222',
      age: 28,
      gender: 'Female',
      bloodGroup: 'B+',
      address: 'Ahmedabad, Gujarat',
      registeredDate: '2024-01-12',
      lastVisit: '2024-01-22',
      status: 'active',
      totalBookings: 8,
      totalSpent: '₹5,200'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+91 98765 33333',
      age: 45,
      gender: 'Male',
      bloodGroup: 'O+',
      address: 'Delhi, NCR',
      registeredDate: '2024-01-08',
      lastVisit: '2024-01-18',
      status: 'inactive',
      totalBookings: 5,
      totalSpent: '₹3,800'
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      phone: '+91 98765 44444',
      age: 31,
      gender: 'Female',
      bloodGroup: 'AB+',
      address: 'Hyderabad, Telangana',
      registeredDate: '2024-01-15',
      lastVisit: '2024-01-25',
      status: 'active',
      totalBookings: 15,
      totalSpent: '₹12,400'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91 98765 55555',
      age: 52,
      gender: 'Male',
      bloodGroup: 'A-',
      address: 'Jaipur, Rajasthan',
      registeredDate: '2024-01-05',
      lastVisit: '2024-01-15',
      status: 'active',
      totalBookings: 20,
      totalSpent: '₹18,900'
    },
    {
      id: 6,
      name: 'Anjali Gupta',
      email: 'anjali.gupta@email.com',
      phone: '+91 98765 66666',
      age: 26,
      gender: 'Female',
      bloodGroup: 'O-',
      address: 'Pune, Maharashtra',
      registeredDate: '2024-01-18',
      lastVisit: '2024-01-19',
      status: 'active',
      totalBookings: 3,
      totalSpent: '₹2,100'
    },
    {
      id: 7,
      name: 'Rajesh Iyer',
      email: 'rajesh.iyer@email.com',
      phone: '+91 98765 77777',
      age: 38,
      gender: 'Male',
      bloodGroup: 'B-',
      address: 'Chennai, Tamil Nadu',
      registeredDate: '2024-01-03',
      lastVisit: '2024-01-14',
      status: 'inactive',
      totalBookings: 7,
      totalSpent: '₹4,600'
    },
    {
      id: 8,
      name: 'Meera Krishnan',
      email: 'meera.krishnan@email.com',
      phone: '+91 98765 88888',
      age: 42,
      gender: 'Female',
      bloodGroup: 'A+',
      address: 'Bangalore, Karnataka',
      registeredDate: '2024-01-20',
      lastVisit: '2024-01-21',
      status: 'active',
      totalBookings: 6,
      totalSpent: '₹4,200'
    },
    {
      id: 9,
      name: 'Arjun Nair',
      email: 'arjun.nair@email.com',
      phone: '+91 98765 99999',
      age: 29,
      gender: 'Male',
      bloodGroup: 'O+',
      address: 'Kochi, Kerala',
      registeredDate: '2024-01-22',
      lastVisit: '2024-01-23',
      status: 'active',
      totalBookings: 4,
      totalSpent: '₹2,800'
    },
    {
      id: 10,
      name: 'Kavita Desai',
      email: 'kavita.desai@email.com',
      phone: '+91 98765 10101',
      age: 35,
      gender: 'Female',
      bloodGroup: 'AB-',
      address: 'Surat, Gujarat',
      registeredDate: '2024-01-11',
      lastVisit: '2024-01-16',
      status: 'active',
      totalBookings: 10,
      totalSpent: '₹7,300'
    }
  ]);

  const handleToggleStatus = (patientId) => {
    setPatients(patients.map(patient => {
      if (patient.id === patientId) {
        const newStatus = patient.status === 'active' ? 'inactive' : 'active';
        showSuccess('Success!', `Patient ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
        return { ...patient, status: newStatus };
      }
      return patient;
    }));
  };

  const handleViewDetails = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = patients.filter(p => p.status === 'active').length;
  const inactiveCount = patients.filter(p => p.status === 'inactive').length;

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="All Patients" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">All Patients</h2>
                <p className="text-muted mb-0">Manage registered patients in the system</p>
              </div>
              <div className="col-md-6 text-md-end">
                <span className="badge bg-success me-2 fs-6">{activeCount} Active</span>
                <span className="badge bg-secondary fs-6">{inactiveCount} Inactive</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Patients</p>
                      <h4 className="mb-0 fw-bold">{patients.length}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-people text-primary" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Active Patients</p>
                      <h4 className="mb-0 fw-bold">{activeCount}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-person-check text-primary" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">New This Month</p>
                      <h4 className="mb-0 fw-bold">45</h4>
                    </div>
                    <div className="icon-bg bg-info bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-person-plus text-info" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h4 className="mb-0 fw-bold">₹69,800</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-currency-rupee text-primary" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
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
                      <option value="inactive">Inactive Only</option>
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
                    <button className="btn btn-outline-secondary ms-2">
                      <i className="bi bi-download me-1"></i> Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Patients Display */}
            {filteredPatients.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{fontSize: '48px'}}></i>
                  <h5 className="mt-3 text-muted">No patients found</h5>
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
                          <th className="px-4 py-3">Patient</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3">Age/Gender</th>
                          <th className="px-4 py-3">Blood Group</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Last Visit</th>
                          <th className="px-4 py-3">Bookings</th>
                          <th className="px-4 py-3">Total Spent</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map(patient => (
                          <tr key={patient.id}>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center">
                                <div className={`avatar-circle ${patient.gender === 'Male' ? 'bg-primary' : 'bg-danger'} bg-opacity-10 me-3`}>
                                  <i className={`bi ${patient.gender === 'Male' ? 'bi-person text-primary' : 'bi-person-dress text-danger'}`}></i>
                                </div>
                                <div>
                                  <div className="fw-semibold">{patient.name}</div>
                                  <small className="text-muted">ID: #{patient.id}</small>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <small className="d-block">{patient.email}</small>
                                <small className="text-muted">{patient.phone}</small>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span>{patient.age} / {patient.gender}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="badge bg-danger bg-opacity-10 text-danger">
                                {patient.bloodGroup}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <small>{patient.address}</small>
                            </td>
                            <td className="px-4 py-3">
                              <small>{new Date(patient.lastVisit).toLocaleDateString()}</small>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <strong>{patient.totalBookings}</strong>
                            </td>
                            <td className="px-4 py-3">
                              <strong className="text-success">{patient.totalSpent}</strong>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${patient.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                {patient.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewDetails(patient.id)}
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  className={`btn btn-sm ${patient.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => handleToggleStatus(patient.id)}
                                  title={patient.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                  <i className={`bi ${patient.status === 'active' ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
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
                {filteredPatients.map(patient => (
                  <div key={patient.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm patient-card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className={`avatar-circle-large ${patient.gender === 'Male' ? 'bg-primary' : 'bg-danger'} bg-opacity-10`}>
                            <i className={`bi ${patient.gender === 'Male' ? 'bi-person text-primary' : 'bi-person-dress text-danger'}`}></i>
                          </div>
                          <span className={`badge ${patient.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {patient.status}
                          </span>
                        </div>
                        <h5 className="fw-bold mb-1">{patient.name}</h5>
                        <p className="text-muted small mb-1">ID: #{patient.id}</p>
                        <p className="text-muted small mb-3">{patient.email}</p>
                        
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-phone text-primary me-2"></i>
                              <small>{patient.phone}</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-geo-alt text-danger me-2"></i>
                              <small>{patient.address.split(',')[0]}</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-calendar-check text-success me-2"></i>
                              <small>{patient.totalBookings} bookings</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-currency-rupee text-warning me-2"></i>
                              <small>{patient.totalSpent}</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-person-badge text-info me-2"></i>
                              <small>{patient.age}Y / {patient.gender}</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-droplet-fill text-danger me-2"></i>
                              <small>{patient.bloodGroup}</small>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => handleViewDetails(patient.id)}>
                            <i className="bi bi-eye me-1"></i>
                            View Details
                          </button>
                          <button
                            className={`btn btn-sm ${patient.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleStatus(patient.id)}
                            title={patient.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${patient.status === 'active' ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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

export default AllPatients;
