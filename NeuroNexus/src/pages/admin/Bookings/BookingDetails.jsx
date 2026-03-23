import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './BookingDetails.css';

function BookingDetails() {
  const { alert, showSuccess, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    // In real app, fetch from Firebase using booking ID
    // For now, using mock data
    setTimeout(() => {
      setBooking({
        id: id,
        type: 'doctor',
        status: 'confirmed',
        paymentStatus: 'paid',
        
        // Patient Information
        patient: {
          id: 'P001',
          name: 'Priya Patel',
          email: 'priya.patel@email.com',
          phone: '+91 98765 22222',
          age: 28,
          gender: 'Female',
          bloodGroup: 'B+',
          address: '123 MG Road, Ahmedabad, Gujarat 380001'
        },
        
        // Doctor Information (if type is doctor)
        doctor: {
          id: 'D001',
          name: 'Dr. Anita Desai',
          specialization: 'Cardiologist',
          licenseNumber: 'MCI-11111',
          phone: '+91 98765 11111',
          email: 'anita.desai@email.com',
          clinicName: 'Apollo Clinic',
          clinicAddress: '456 Station Road, Mumbai, Maharashtra 400001'
        },
        
        // Lab Information (if type is lab)
        lab: null,
        
        // Booking Details
        bookingDate: '2024-01-26',
        bookingTime: '02:00 PM',
        duration: '30 minutes',
        testName: 'Cardiology Consultation',
        reason: 'Chest pain and irregular heartbeat',
        symptoms: 'Chest discomfort, shortness of breath, palpitations',
        medicalHistory: 'No previous heart conditions. Family history of heart disease.',
        
        // Payment Information
        consultationFee: '₹1000',
        platformFee: '₹50',
        totalAmount: '₹1050',
        paymentMethod: 'UPI',
        transactionId: 'TXN1234567890',
        paymentDate: '2024-01-21 03:45 PM',
        
        // Notes & Instructions
        notes: 'Patient should bring previous ECG reports if available. Fasting not required.',
        doctorNotes: '',
        prescription: '',
        
        // Timestamps
        createdAt: '2024-01-21 03:30 PM',
        updatedAt: '2024-01-21 04:00 PM',
        confirmedAt: '2024-01-21 04:00 PM',
        completedAt: null,
        cancelledAt: null,
        
        // Additional Info
        bookingSource: 'Mobile App',
        bookingChannel: 'Patient Self-Booking',
        reminderSent: true,
        confirmationSent: true
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBack = () => {
    navigate('/bookings');
  };

  const handleUpdateStatus = (newStatus) => {
    setBooking({ ...booking, status: newStatus });
    showSuccess('Success!', `Booking status updated to ${newStatus}.`);
  };

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBooking({ ...booking, status: 'cancelled', cancelledAt: new Date().toLocaleString() });
      showSuccess('Success!', 'Booking cancelled successfully.');
    }
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

  const getPaymentBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      paid: 'bg-success',
      refunded: 'bg-secondary',
      failed: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} pageTitle="Booking Details" />
          <div className="flex-grow-1 overflow-y-auto d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} pageTitle="Booking Details" />
          <div className="flex-grow-1 overflow-y-auto d-flex align-items-center justify-content-center">
            <div className="text-center">
              <i className="bi bi-exclamation-triangle text-warning" style={{fontSize: '48px'}}></i>
              <h5 className="mt-3">Booking not found</h5>
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
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Booking Details" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Back Button */}
            <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Bookings
            </button>

            {/* Booking Header */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-circle-large bg-primary bg-opacity-10 text-primary me-3">
                        <i className={`bi ${booking.type === 'lab' ? 'bi-buildings' : 'bi-person-doctor'}`}></i>
                      </div>
                      <div>
                        <h3 className="mb-1 fw-bold">Booking #{booking.id}</h3>
                        <p className="text-muted mb-0">
                          {booking.type === 'lab' ? 'Lab Test Booking' : 'Doctor Consultation'}
                        </p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <span className={`badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`badge ${getPaymentBadge(booking.paymentStatus)}`}>
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6 text-md-end mt-3 mt-md-0">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleUpdateStatus('confirmed')}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Confirm Booking
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={handleCancelBooking}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          className="btn btn-primary me-2"
                          onClick={() => handleUpdateStatus('completed')}
                        >
                          <i className="bi bi-check-all me-1"></i>
                          Mark Completed
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={handleCancelBooking}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <button className="btn btn-outline-primary">
                        <i className="bi bi-file-earmark-medical me-1"></i>
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column */}
              <div className="col-lg-8">
                {/* Booking Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-calendar-event text-primary me-2"></i>
                      Booking Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Booking Date</label>
                        <p className="mb-0 fw-semibold">{new Date(booking.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Booking Time</label>
                        <p className="mb-0 fw-semibold">{booking.bookingTime}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Duration</label>
                        <p className="mb-0 fw-semibold">{booking.duration}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Test/Service</label>
                        <p className="mb-0 fw-semibold">{booking.testName}</p>
                      </div>
                      <div className="col-12">
                        <label className="text-muted small mb-1">Reason for Visit</label>
                        <p className="mb-0">{booking.reason}</p>
                      </div>
                      <div className="col-12">
                        <label className="text-muted small mb-1">Symptoms</label>
                        <p className="mb-0">{booking.symptoms}</p>
                      </div>
                      <div className="col-12">
                        <label className="text-muted small mb-1">Medical History</label>
                        <p className="mb-0">{booking.medicalHistory}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-person text-primary me-2"></i>
                      Patient Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Patient Name</label>
                        <p className="mb-0 fw-semibold">{booking.patient.name}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Patient ID</label>
                        <p className="mb-0"><code>{booking.patient.id}</code></p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Email</label>
                        <p className="mb-0">{booking.patient.email}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted small mb-1">Phone</label>
                        <p className="mb-0">{booking.patient.phone}</p>
                      </div>
                      <div className="col-md-4">
                        <label className="text-muted small mb-1">Age</label>
                        <p className="mb-0 fw-semibold">{booking.patient.age} years</p>
                      </div>
                      <div className="col-md-4">
                        <label className="text-muted small mb-1">Gender</label>
                        <p className="mb-0 fw-semibold">{booking.patient.gender}</p>
                      </div>
                      <div className="col-md-4">
                        <label className="text-muted small mb-1">Blood Group</label>
                        <p className="mb-0">
                          <span className="badge bg-danger">{booking.patient.bloodGroup}</span>
                        </p>
                      </div>
                      <div className="col-12">
                        <label className="text-muted small mb-1">Address</label>
                        <p className="mb-0">{booking.patient.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor/Lab Information */}
                {booking.type === 'doctor' && booking.doctor && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <h5 className="fw-bold mb-3">
                        <i className="bi bi-person-doctor text-primary me-2"></i>
                        Doctor Information
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Doctor Name</label>
                          <p className="mb-0 fw-semibold">{booking.doctor.name}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Specialization</label>
                          <p className="mb-0">
                            <span className="badge bg-info">{booking.doctor.specialization}</span>
                          </p>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">License Number</label>
                          <p className="mb-0"><code>{booking.doctor.licenseNumber}</code></p>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Phone</label>
                          <p className="mb-0">{booking.doctor.phone}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Clinic Name</label>
                          <p className="mb-0 fw-semibold">{booking.doctor.clinicName}</p>
                        </div>
                        <div className="col-md-6">
                          <label className="text-muted small mb-1">Email</label>
                          <p className="mb-0">{booking.doctor.email}</p>
                        </div>
                        <div className="col-12">
                          <label className="text-muted small mb-1">Clinic Address</label>
                          <p className="mb-0">{booking.doctor.clinicAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes & Instructions */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-journal-text text-primary me-2"></i>
                      Notes & Instructions
                    </h5>
                    <div className="mb-3">
                      <label className="text-muted small mb-1">Booking Notes</label>
                      <p className="mb-0">{booking.notes || 'No additional notes'}</p>
                    </div>
                    {booking.doctorNotes && (
                      <div className="mb-3">
                        <label className="text-muted small mb-1">Doctor's Notes</label>
                        <div className="alert alert-info mb-0">
                          {booking.doctorNotes}
                        </div>
                      </div>
                    )}
                    {booking.prescription && (
                      <div>
                        <label className="text-muted small mb-1">Prescription</label>
                        <div className="alert alert-success mb-0">
                          {booking.prescription}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                {/* Payment Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-credit-card text-primary me-2"></i>
                      Payment Details
                    </h5>
                    <div className="mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Consultation Fee</span>
                        <span className="fw-semibold">{booking.consultationFee}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Platform Fee</span>
                        <span className="fw-semibold">{booking.platformFee}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Total Amount</span>
                        <span className="fw-bold text-success fs-5">{booking.totalAmount}</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Payment Status</label>
                      <p className="mb-0">
                        <span className={`badge ${getPaymentBadge(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </p>
                    </div>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Payment Method</label>
                      <p className="mb-0 fw-semibold">{booking.paymentMethod}</p>
                    </div>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Transaction ID</label>
                      <p className="mb-0"><code>{booking.transactionId}</code></p>
                    </div>
                    <div>
                      <label className="text-muted small mb-1">Payment Date</label>
                      <p className="mb-0">{booking.paymentDate}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-clock-history text-primary me-2"></i>
                      Booking Timeline
                    </h5>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-icon bg-primary">
                          <i className="bi bi-plus-circle"></i>
                        </div>
                        <div className="timeline-content">
                          <p className="mb-0 fw-semibold small">Booking Created</p>
                          <small className="text-muted">{booking.createdAt}</small>
                        </div>
                      </div>
                      {booking.confirmedAt && (
                        <div className="timeline-item">
                          <div className="timeline-icon bg-info">
                            <i className="bi bi-check-circle"></i>
                          </div>
                          <div className="timeline-content">
                            <p className="mb-0 fw-semibold small">Booking Confirmed</p>
                            <small className="text-muted">{booking.confirmedAt}</small>
                          </div>
                        </div>
                      )}
                      {booking.completedAt && (
                        <div className="timeline-item">
                          <div className="timeline-icon bg-success">
                            <i className="bi bi-check-all"></i>
                          </div>
                          <div className="timeline-content">
                            <p className="mb-0 fw-semibold small">Booking Completed</p>
                            <small className="text-muted">{booking.completedAt}</small>
                          </div>
                        </div>
                      )}
                      {booking.cancelledAt && (
                        <div className="timeline-item">
                          <div className="timeline-icon bg-danger">
                            <i className="bi bi-x-circle"></i>
                          </div>
                          <div className="timeline-content">
                            <p className="mb-0 fw-semibold small">Booking Cancelled</p>
                            <small className="text-muted">{booking.cancelledAt}</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-info-circle text-primary me-2"></i>
                      Additional Information
                    </h5>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Booking Source</label>
                      <p className="mb-0">{booking.bookingSource}</p>
                    </div>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Booking Channel</label>
                      <p className="mb-0">{booking.bookingChannel}</p>
                    </div>
                    <div className="mb-2">
                      <label className="text-muted small mb-1">Reminder Sent</label>
                      <p className="mb-0">
                        {booking.reminderSent ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-secondary">No</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-muted small mb-1">Confirmation Sent</label>
                      <p className="mb-0">
                        {booking.confirmationSent ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-secondary">No</span>
                        )}
                      </p>
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

export default BookingDetails;
