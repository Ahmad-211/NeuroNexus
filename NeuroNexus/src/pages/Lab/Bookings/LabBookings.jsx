import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import './LabBookings.css';

function LabBookings() {
  const navigate = useNavigate();
  const { currentUser, getLabBookings } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings from Firebase
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const result = await getLabBookings(currentUser.uid);
        if (result.success) {
          setAllBookings(result.bookings);
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
  }, [currentUser]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Payment status helper
  const getPaymentStatus = (booking) => {
    return booking.payment?.paymentStatus || booking.paymentStatus || 'N/A';
  };

  // Filter bookings
  const filteredBookings = allBookings.filter(booking => {
    const query = searchQuery.toLowerCase();
    const patientName = (booking.patientNameSnapshot || booking.patientInfo?.fullName || '').toLowerCase();
    const testName = (booking.testName || '').toLowerCase();
    const bookingId = (booking.bookingId || booking.id || '').toLowerCase();
    const matchesSearch = patientName.includes(query) || testName.includes(query) || bookingId.includes(query);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const paymentStatus = getPaymentStatus(booking);
    const matchesPayment = paymentFilter === 'all' || paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Stats
  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
  const completedBookings = allBookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;

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

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Bookings" />

        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="mb-1 fw-bold">Booking Management</h2>
                <p className="text-muted mb-0">Manage all test bookings</p>
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
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by booking ID, patient, or test name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                  <div className="col-md-3">
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
                            <th className="px-4 py-3">Patient Name</th>
                            <th className="px-4 py-3">Test Name</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Price (₹)</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map((booking) => {
                            const patientName = booking.patientNameSnapshot || booking.patientInfo?.fullName || 'N/A';
                            const price = booking.payment?.amount || 'N/A';
                            const displayId = booking.bookingId || booking.id;
                            const paymentStatus = getPaymentStatus(booking);

                            return (
                              <tr key={booking.id}>
                                <td className="px-4 py-3">
                                  <span className="fw-semibold text-primary">{displayId}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-circle bg-primary text-white me-2">
                                      {patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <span className="fw-semibold">{patientName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-dark">{booking.testName || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="fw-semibold">{booking.testDate || booking.selectedDate || booking.date || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <small className="text-muted">{booking.testTime || booking.selectedTime || booking.time || 'N/A'}</small>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="fw-semibold">
                                    {typeof price === 'number' ? `₹${price}` : price}
                                  </span>
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
                                <td className="px-4 py-3 text-center">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/lab/bookings/${booking.bookingId || booking.id}`)}
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    View Details
                                  </button>
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

export default LabBookings;
