import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './PatientDetails.css';

function PatientDetails() {
  const { alert, showSuccess, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    // In real app, fetch from Firebase using patient ID
    // For now, using mock data
    setTimeout(() => {
      setPatient({
        id: id,
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 98765 22222',
        age: 28,
        gender: 'Female',
        bloodGroup: 'B+',
        address: '123 MG Road, Ahmedabad, Gujarat 380001',
        registeredDate: '2024-01-12',
        lastVisit: '2024-01-22',
        status: 'active',
        totalBookings: 15,
        totalSpent: '₹12,400',
        
        // Medical Information
        medicalHistory: {
          allergies: ['Penicillin', 'Peanuts'],
          chronicConditions: ['Asthma'],
          currentMedications: ['Albuterol Inhaler'],
          emergencyContact: {
            name: 'Rajesh Patel',
            relation: 'Spouse',
            phone: '+91 98765 33333'
          }
        },
        
        // Lab Test Bookings
        labBookings: [
          {
            id: 'LB001',
            testName: 'Complete Blood Count (CBC)',
            labName: 'Pathology Lab - Ahmedabad',
            date: '2024-01-22',
            time: '10:00 AM',
            status: 'completed',
            amount: '₹500',
            reportAvailable: true
          },
          {
            id: 'LB002',
            testName: 'Thyroid Function Test',
            labName: 'Medical Lab - Ahmedabad',
            date: '2024-01-15',
            time: '09:00 AM',
            status: 'completed',
            amount: '₹600',
            reportAvailable: true
          },
          {
            id: 'LB003',
            testName: 'Lipid Profile',
            labName: 'Diagnostic Center - Ahmedabad',
            date: '2024-01-28',
            time: '08:00 AM',
            status: 'pending',
            amount: '₹800',
            reportAvailable: false
          },
          {
            id: 'LB004',
            testName: 'HbA1c Test',
            labName: 'Health Clinic Lab - Ahmedabad',
            date: '2024-01-05',
            time: '07:30 AM',
            status: 'completed',
            amount: '₹450',
            reportAvailable: true
          }
        ],
        
        // Doctor Appointments
        doctorAppointments: [
          {
            id: 'DA001',
            doctorName: 'Dr. Anita Desai',
            specialization: 'Cardiologist',
            clinicName: 'Apollo Clinic',
            date: '2024-01-20',
            time: '02:00 PM',
            status: 'completed',
            consultationFee: '₹1000',
            prescriptionAvailable: true
          },
          {
            id: 'DA002',
            doctorName: 'Dr. Suresh Menon',
            specialization: 'Neurologist',
            clinicName: 'City Hospital',
            date: '2024-01-18',
            time: '11:00 AM',
            status: 'completed',
            consultationFee: '₹1200',
            prescriptionAvailable: true
          },
          {
            id: 'DA003',
            doctorName: 'Dr. Kavita Iyer',
            specialization: 'General Physician',
            clinicName: 'Medicare Clinic',
            date: '2024-01-30',
            time: '04:00 PM',
            status: 'confirmed',
            consultationFee: '₹800',
            prescriptionAvailable: false
          },
          {
            id: 'DA004',
            doctorName: 'Dr. Ramesh Nair',
            specialization: 'Orthopedic',
            clinicName: 'Bone Care Center',
            date: '2024-01-12',
            time: '10:30 AM',
            status: 'completed',
            consultationFee: '₹1500',
            prescriptionAvailable: true
          },
          {
            id: 'DA005',
            doctorName: 'Dr. Meera Krishnan',
            specialization: 'Dermatologist',
            clinicName: 'Skin Care Clinic',
            date: '2024-02-05',
            time: '03:00 PM',
            status: 'pending',
            consultationFee: '₹900',
            prescriptionAvailable: false
          }
        ]
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBack = () => {
    navigate('/patients');
  };

  const handleViewBookingDetails = (bookingId) => {
    navigate(`/bookings/${bookingId}`);
  };

  const handleToggleStatus = () => {
    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    setPatient({ ...patient, status: newStatus });
    showSuccess('Success!', `Patient ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-info',
      completed: 'bg-success',
      cancelled: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} pageTitle="Patient Details" />
          <div className="flex-grow-1 overflow-y-auto d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} pageTitle="Patient Details" />
          <div className="flex-grow-1 overflow-y-auto d-flex align-items-center justify-content-center">
            <div className="text-center">
              <i className="bi bi-exclamation-triangle text-warning" style={{fontSize: '48px'}}></i>
              <h5 className="mt-3">Patient not found</h5>
              <button className="btn btn-primary mt-3" onClick={handleBack}>
                Go Back
              </button>
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
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Patient Details" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Back Button */}
            <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Patients
            </button>

            {/* Patient Profile Header */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-8">
                    <div className="d-flex align-items-start">
                      <div className={`avatar-circle-xlarge ${patient.gender === 'Male' ? 'bg-primary' : 'bg-danger'} bg-opacity-10 me-4`}>
                        <i className={`bi ${patient.gender === 'Male' ? 'bi-person text-primary' : 'bi-person-dress text-danger'}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <h2 className="fw-bold mb-0 me-3">{patient.name}</h2>
                          <span className={`badge ${patient.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {patient.status}
                          </span>
                        </div>
                        <p className="text-muted mb-2">Patient ID: <code>#{patient.id}</code></p>
                        <div className="row g-3 mb-3">
                          <div className="col-auto">
                            <span className="text-muted">
                              <i className="bi bi-envelope me-1"></i>
                              {patient.email}
                            </span>
                          </div>
                          <div className="col-auto">
                            <span className="text-muted">
                              <i className="bi bi-phone me-1"></i>
                              {patient.phone}
                            </span>
                          </div>
                          <div className="col-auto">
                            <span className="text-muted">
                              <i className="bi bi-person-badge me-1"></i>
                              {patient.age} years / {patient.gender}
                            </span>
                          </div>
                          <div className="col-auto">
                            <span className="badge bg-danger">{patient.bloodGroup}</span>
                          </div>
                        </div>
                        <div className="d-flex gap-3">
                          <div>
                            <small className="text-muted d-block">Total Bookings</small>
                            <strong className="fs-5">{patient.totalBookings}</strong>
                          </div>
                          <div className="vr"></div>
                          <div>
                            <small className="text-muted d-block">Total Spent</small>
                            <strong className="fs-5 text-success">{patient.totalSpent}</strong>
                          </div>
                          <div className="vr"></div>
                          <div>
                            <small className="text-muted d-block">Last Visit</small>
                            <strong className="fs-6">{new Date(patient.lastVisit).toLocaleDateString()}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <button
                      className={`btn ${patient.status === 'active' ? 'btn-warning' : 'btn-success'} w-100 mb-2`}
                      onClick={handleToggleStatus}
                    >
                      <i className={`bi ${patient.status === 'active' ? 'bi-pause-circle' : 'bi-play-circle'} me-2`}></i>
                      {patient.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-outline-primary w-100">
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column */}
              <div className="col-lg-4">
                {/* Personal Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-person-lines-fill text-primary me-2"></i>
                      Personal Information
                    </h5>
                    <div className="mb-3">
                      <label className="text-muted small mb-1">Full Address</label>
                      <p className="mb-0">{patient.address}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small mb-1">Registered Date</label>
                      <p className="mb-0">{new Date(patient.registeredDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-heart-pulse text-primary me-2"></i>
                      Medical Information
                    </h5>
                    <div className="mb-3">
                      <label className="text-muted small mb-1">Allergies</label>
                      <div className="d-flex flex-wrap gap-2">
                        {patient.medicalHistory.allergies.map((allergy, index) => (
                          <span key={index} className="badge bg-danger bg-opacity-10 text-danger">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small mb-1">Chronic Conditions</label>
                      <div className="d-flex flex-wrap gap-2">
                        {patient.medicalHistory.chronicConditions.map((condition, index) => (
                          <span key={index} className="badge bg-warning bg-opacity-10 text-warning">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted small mb-1">Current Medications</label>
                      <div className="d-flex flex-wrap gap-2">
                        {patient.medicalHistory.currentMedications.map((medication, index) => (
                          <span key={index} className="badge bg-info bg-opacity-10 text-info">
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-telephone text-primary me-2"></i>
                      Emergency Contact
                    </h5>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Name</label>
                      <p className="mb-0 fw-semibold">{patient.medicalHistory.emergencyContact.name}</p>
                    </div>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Relation</label>
                      <p className="mb-0">{patient.medicalHistory.emergencyContact.relation}</p>
                    </div>
                    <div>
                      <label className="text-muted small mb-1">Phone</label>
                      <p className="mb-0">{patient.medicalHistory.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-8">
                {/* Lab Test Bookings */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-buildings text-primary me-2"></i>
                      Lab Test Bookings ({patient.labBookings.length})
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-3 py-2">Test Name</th>
                            <th className="px-3 py-2">Lab Name</th>
                            <th className="px-3 py-2">Date & Time</th>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patient.labBookings.map(booking => (
                            <tr key={booking.id}>
                              <td className="px-3 py-2">
                                <div className="fw-semibold">{booking.testName}</div>
                              </td>
                              <td className="px-3 py-2">
                                <small>{booking.labName}</small>
                              </td>
                              <td className="px-3 py-2">
                                <div>
                                  <div className="small">{new Date(booking.date).toLocaleDateString()}</div>
                                  <small className="text-muted">{booking.time}</small>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <strong className="text-success">{booking.amount}</strong>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`badge ${getStatusBadge(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewBookingDetails(booking.id)}
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  {booking.reportAvailable && (
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      title="Download Report"
                                    >
                                      <i className="bi bi-download"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Doctor Appointments */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-person-doctor text-primary me-2"></i>
                      Doctor Appointments ({patient.doctorAppointments.length})
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-3 py-2">Doctor</th>
                            <th className="px-3 py-2">Specialization</th>
                            <th className="px-3 py-2">Clinic</th>
                            <th className="px-3 py-2">Date & Time</th>
                            <th className="px-3 py-2">Fee</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patient.doctorAppointments.map(appointment => (
                            <tr key={appointment.id}>
                              <td className="px-3 py-2">
                                <div className="fw-semibold">{appointment.doctorName}</div>
                              </td>
                              <td className="px-3 py-2">
                                <span className="badge bg-info bg-opacity-10 text-info">
                                  {appointment.specialization}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <small>{appointment.clinicName}</small>
                              </td>
                              <td className="px-3 py-2">
                                <div>
                                  <div className="small">{new Date(appointment.date).toLocaleDateString()}</div>
                                  <small className="text-muted">{appointment.time}</small>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <strong className="text-success">{appointment.consultationFee}</strong>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`badge ${getStatusBadge(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewBookingDetails(appointment.id)}
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  {appointment.prescriptionAvailable && (
                                    <button
                                      className="btn btn-sm btn-outline-success"
                                      title="Download Prescription"
                                    >
                                      <i className="bi bi-file-earmark-medical"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export default PatientDetails;
