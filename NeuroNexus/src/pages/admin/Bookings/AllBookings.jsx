import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './AllBookings.css';

function AllBookings() {
  const { getAllBookings } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch bookings from Firebase
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAllBookings();
        if (result.success) {
          setBookings(result.bookings);
        } else {
          setError(result.error || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Helper: detect if booking is a doctor type
  const isDoctorBooking = (booking) => {
    const type = (booking.bookingType || '').toLowerCase();
    return type === 'doctor_appointment' || type === 'doctor' || 
           type === 'doctor_consultation' ||
           // Fallback: if it has doctor-specific fields but no lab-specific fields
           (!!(booking.doctorName || booking.selectedDoctor || booking.doctorId) && !booking.labName && !booking.labId);
  };

  const getBookingType = (booking) => {
    return isDoctorBooking(booking) ? 'doctor' : 'lab';
  };

  const getAssignedTo = (booking) => {
    if (isDoctorBooking(booking)) {
      return booking.doctorName || booking.selectedDoctor || 'N/A';
    }
    return booking.labName || 'N/A';
  };

  const getServiceName = (booking) => {
    if (isDoctorBooking(booking)) {
      return booking.reasonForVisit || booking.specialization || booking.reason || 'N/A';
    }
    return booking.testName || 'N/A';
  };

  const getBookingDate = (booking) => {
    if (isDoctorBooking(booking)) {
      return booking.appointmentDate || booking.selectedDate || booking.date || 'N/A';
    }
    return booking.testDate || booking.selectedDate || booking.date || 'N/A';
  };

  const getBookingTime = (booking) => {
    if (isDoctorBooking(booking)) {
      return booking.appointmentTime || booking.selectedTime || booking.time || 'N/A';
    }
    return booking.testTime || booking.selectedTime || booking.time || 'N/A';
  };

  const getPaymentStatus = (booking) => {
    return booking.payment?.paymentStatus || booking.paymentStatus || 'N/A';
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const bookingId = (booking.bookingId || booking.id || '').toLowerCase();
    const patientName = (booking.patientNameSnapshot || '').toLowerCase();
    const assignedTo = getAssignedTo(booking).toLowerCase();
    const matchesSearch = bookingId.includes(searchTerm.toLowerCase()) ||
      patientName.includes(searchTerm.toLowerCase()) ||
      assignedTo.includes(searchTerm.toLowerCase());
    const type = getBookingType(booking);
    const matchesType = bookingTypeFilter === 'all' || type === bookingTypeFilter;
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const paymentStatus = getPaymentStatus(booking);
    const matchesPayment = paymentFilter === 'all' || paymentStatus === paymentFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPayment;
  });

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-info',
      completed: 'bg-success',
      cancelled: 'bg-danger',
      expired: 'bg-secondary',
      no_show: 'bg-dark'
    };
    return badges[status] || 'bg-secondary';
  };

  const getPaymentBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      paid: 'bg-success',
      partial: 'bg-info',
      refunded: 'bg-secondary',
      failed: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    return type === 'lab' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-success text-white';
  };

  const getTypeIcon = (type) => {
    return type === 'lab' ? 'bi-buildings' : 'bi-person-doctor';
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="All Bookings" />

        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="mb-1 fw-bold">All Bookings</h2>
                <p className="text-muted mb-0">View all lab and doctor appointments</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Bookings</p>
                      <h4 className="mb-0 fw-bold">{totalBookings}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-calendar-check text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Pending</p>
                      <h4 className="mb-0 fw-bold text-warning">{pendingBookings}</h4>
                    </div>
                    <div className="icon-bg bg-warning bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Completed</p>
                      <h4 className="mb-0 fw-bold text-success">{completedBookings}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-check-circle text-success" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Cancelled</p>
                      <h4 className="mb-0 fw-bold text-danger">{cancelledBookings}</h4>
                    </div>
                    <div className="icon-bg bg-danger bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-x-circle text-danger" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by booking ID, patient, or provider..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={bookingTypeFilter}
                      onChange={(e) => setBookingTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="lab">Lab Bookings</option>
                      <option value="doctor">Doctor Bookings</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                      <option value="all">All Payments</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-outline-secondary w-100">
                      <i className="bi bi-download me-2"></i>Export
                    </button>
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
                  <p className="text-muted mb-0">Loading bookings...</p>
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

            {/* Bookings Table */}
            {!loading && !error && (
              filteredBookings.length === 0 ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '48px' }}></i>
                    <h5 className="mt-3 text-muted">No bookings found</h5>
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
                            <th className="px-4 py-3">Booking ID</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Assigned To</th>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map(booking => {
                            const type = getBookingType(booking);
                            const displayId = booking.bookingId || booking.id;
                            const dateStr = getBookingDate(booking);
                            const timeStr = getBookingTime(booking);
                            const paymentStatus = getPaymentStatus(booking);

                            return (
                              <tr key={booking.id}>
                                <td className="px-4 py-3">
                                  <code className="text-primary fw-semibold">{displayId}</code>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`badge ${getTypeBadge(type)}`}>
                                    <i className={`bi ${getTypeIcon(type)} me-1`}></i>
                                    {type === 'lab' ? 'Lab' : 'Doctor'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="fw-semibold">{booking.patientNameSnapshot || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <small>{getAssignedTo(booking)}</small>
                                </td>
                                <td className="px-4 py-3">
                                  <small>{getServiceName(booking)}</small>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="fw-semibold">{dateStr}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <small className="text-muted">{timeStr}</small>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`badge ${getStatusBadge(booking.status)}`}>
                                    {booking.status || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`badge ${getPaymentBadge(paymentStatus)}`}>
                                    {paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
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
    </div>
  );
}

export default AllBookings;
