import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './LabBookingDetails.css';

function LabBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookingById, updateBookingStatus } = useFirebase();
  const { alert, showSuccess, showError, showInfo, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch booking from Firebase
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const result = await getBookingById(id);
        if (result.success) {
          setBooking(result.booking);
          setBookingStatus(result.booking.status || 'pending');
        } else {
          setFetchError(result.error || 'Booking not found');
        }
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleStatusUpdate = async () => {
    if (!booking) return;
    setUpdating(true);
    try {
      const result = await updateBookingStatus(booking.bookingId || booking.id, bookingStatus);
      if (result.success) {
        setBooking(prev => ({ ...prev, status: bookingStatus }));
        showSuccess('Success!', `Booking status updated to ${bookingStatus}.`);
      } else {
        showError('Error', result.error || 'Failed to update status');
      }
    } catch (err) {
      showError('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadReceipt = () => {
    showInfo('Coming Soon', 'Receipt download functionality will be implemented.');
  };

  // Helper to format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Booking Details" />
          <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading booking details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError || !booking) {
    return (
      <div className="d-flex vh-100">
        <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Booking Details" />
          <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <i className="bi bi-exclamation-triangle fs-1 text-danger d-block mb-3"></i>
              <h5 className="text-muted">{fetchError || 'Booking not found'}</h5>
              <button className="btn btn-primary mt-3" onClick={() => navigate('/lab/bookings')}>
                <i className="bi bi-arrow-left me-2"></i>Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract fields from booking
  const patientInfo = booking.patientInfo || {};
  const payment = booking.payment || {};
  const displayId = booking.bookingId || booking.id;
  const patientName = patientInfo.fullName || booking.patientNameSnapshot || 'N/A';

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Booking Details" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <button
                  className="btn btn-link text-decoration-none p-0 mb-2"
                  onClick={() => navigate('/lab/bookings')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Bookings
                </button>
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div>
                    <h2 className="mb-1 fw-bold">Booking Details</h2>
                    <p className="text-muted mb-0">Booking ID: <span className="fw-semibold text-primary">{displayId}</span></p>
                  </div>
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleDownloadReceipt}
                      disabled={payment.paymentStatus !== 'paid'}
                    >
                      <i className="bi bi-download me-2"></i>
                      Download Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column */}
              <div className="col-lg-8">
                {/* Patient Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      Patient Information
                    </h5>
                    {/* Bar 1: Full Name | Phone | Email */}
                    <div className="booking-info-bar mb-3">
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Full Name</label>
                        <p className="fw-semibold mb-0">{patientName}</p>
                      </div>
                      <div className="booking-info-bar-divider"></div>
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Phone Number</label>
                        <p className="fw-semibold mb-0">
                          <i className="bi bi-telephone me-2"></i>
                          {patientInfo.contactNumber || 'N/A'}
                        </p>
                      </div>
                      <div className="booking-info-bar-divider"></div>
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Email Address</label>
                        <p className="fw-semibold mb-0">
                          {patientInfo.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {/* Bar 2: Age | Gender | Relation */}
                    <div className="booking-info-bar">
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Age</label>
                        <p className="fw-semibold mb-0">{patientInfo.age ? `${patientInfo.age} years` : 'N/A'}</p>
                      </div>
                      <div className="booking-info-bar-divider"></div>
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Gender</label>
                        <p className="fw-semibold mb-0">{patientInfo.gender || 'N/A'}</p>
                      </div>
                      {patientInfo.relation && (
                        <>
                          <div className="booking-info-bar-divider"></div>
                          <div className="booking-info-bar-item">
                            <label className="text-muted small d-block">Relation</label>
                            <p className="fw-semibold mb-0">{patientInfo.relation}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Test Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-file-medical me-2 text-primary"></i>
                      Test Information
                    </h5>
                    {/* Bar 1: Test Name | Price */}
                    <div className="booking-info-bar mb-3">
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Test Name</label>
                        <p className="fw-semibold mb-0 fs-5">{booking.testName || 'N/A'}</p>
                      </div>
                      <div className="booking-info-bar-divider"></div>
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Price</label>
                        <p className="fw-bold mb-0 fs-4 text-success">
                          {payment.amount ? `PKR${payment.amount}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {/* Bar 2: Test Type | Test ID */}
                    <div className="booking-info-bar">
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Test Type</label>
                        <p className="mb-0">
                          <span className="badge bg-primary-subtle text-primary">
                            {booking.testType || booking.bookingType || 'N/A'}
                          </span>
                        </p>
                      </div>
                      {booking.testId && (
                        <>
                          <div className="booking-info-bar-divider"></div>
                          <div className="booking-info-bar-item">
                            <label className="text-muted small d-block">Test ID</label>
                            <p className="mb-0 text-secondary small">{booking.testId}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-calendar-check me-2 text-primary"></i>
                      Booking Information
                    </h5>
                    <div className="booking-info-bar">
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Test Date</label>
                        <p className="fw-semibold mb-0">
                          <i className="bi bi-calendar3 me-2"></i>
                          {booking.testDate || 'N/A'}
                        </p>
                      </div>
                      <div className="booking-info-bar-divider"></div>
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Test Time</label>
                        <p className="fw-semibold mb-0">
                          <i className="bi bi-clock me-2"></i>
                          {booking.testTime || 'N/A'}
                        </p>
                      </div>
                      <div className="booking-info-bar-divider"></div>
                      <div className="booking-info-bar-item">
                        <label className="text-muted small d-block">Created On</label>
                        <p className="fw-semibold mb-0">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>
                    {booking.bookingType && (
                      <div className="row g-0 mt-3 pt-3 border-top">
                        <div className="col-md-4 detail-field">
                          <div className="info-item">
                            <label className="text-muted small">Booking Type</label>
                            <p className="fw-semibold mb-0">
                              <span className="badge bg-info">{booking.bookingType}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                {/* Payment Status */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-credit-card me-2 text-primary"></i>
                      Payment Status
                    </h5>
                    <div className="text-center mb-3">
                      {payment.paymentStatus === 'paid' && (
                        <div className="payment-status-badge success">
                          <i className="bi bi-check-circle-fill fs-1 mb-2"></i>
                          <h6 className="fw-bold mb-0">PAID</h6>
                        </div>
                      )}
                      {payment.paymentStatus === 'pending' && (
                        <div className="payment-status-badge warning">
                          <i className="bi bi-hourglass-split fs-1 mb-2"></i>
                          <h6 className="fw-bold mb-0">PENDING</h6>
                        </div>
                      )}
                      {payment.paymentStatus === 'failed' && (
                        <div className="payment-status-badge danger">
                          <i className="bi bi-x-circle-fill fs-1 mb-2"></i>
                          <h6 className="fw-bold mb-0">FAILED</h6>
                        </div>
                      )}
                      {!payment.paymentStatus && (
                        <div className="payment-status-badge warning">
                          <i className="bi bi-question-circle fs-1 mb-2"></i>
                          <h6 className="fw-bold mb-0">UNKNOWN</h6>
                        </div>
                      )}
                    </div>
                    <hr />
                    <div className="mb-3">
                      <label className="text-muted small">Payment Method</label>
                      <p className="fw-semibold mb-0">{payment.paymentMethod || 'N/A'}</p>
                    </div>
                    {payment.paymentId && (
                      <div className="mb-3">
                        <label className="text-muted small">Payment ID</label>
                        <p className="fw-semibold mb-0 text-break">{payment.paymentId}</p>
                      </div>
                    )}
                    {payment.transactionDate && (
                      <div className="mb-3">
                        <label className="text-muted small">Transaction Date</label>
                        <p className="fw-semibold mb-0">{formatDate(payment.transactionDate)}</p>
                      </div>
                    )}
                    {payment.amount && (
                      <div>
                        <label className="text-muted small">Amount</label>
                        <p className="fw-bold mb-0 text-success">{payment.currency || '₹'}{payment.amount}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Status Update */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-gear me-2 text-primary"></i>
                      Update Status
                    </h5>
                    <div className="mb-3">
                      <label className="form-label">Current Status</label>
                      <select
                        className="form-select"
                        value={bookingStatus}
                        onChange={(e) => setBookingStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleStatusUpdate}
                      disabled={updating || bookingStatus === booking.status}
                    >
                      {updating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Status
                        </>
                      )}
                    </button>
                    {bookingStatus !== booking.status && (
                      <small className="text-muted d-block mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Click to save changes
                      </small>
                    )}
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

export default LabBookingDetails;
