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
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter bookings based on active tab and search query
  const filteredBookings = allBookings
    .filter(booking => booking.status === activeTab)
    .filter(booking => {
      const query = searchQuery.toLowerCase();
      const patientName = (booking.patientNameSnapshot || booking.patientInfo?.fullName || '').toLowerCase();
      const testName = (booking.testName || '').toLowerCase();
      const bookingId = (booking.bookingId || booking.id || '').toLowerCase();
      return patientName.includes(query) || testName.includes(query) || bookingId.includes(query);
    });

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

            {/* Tabs and Search Card */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="row align-items-center">
                      {/* Tabs */}
                      <div className="col-md-6 mb-3 mb-md-0">
                        <ul className="nav nav-pills booking-tabs">
                          <li className="nav-item">
                            <button
                              className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                              onClick={() => setActiveTab('pending')}
                            >
                              <i className="bi bi-hourglass-split me-2"></i>
                              Pending
                              <span className="badge bg-warning ms-2">
                                {allBookings.filter(b => b.status === 'pending').length}
                              </span>
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                              onClick={() => setActiveTab('completed')}
                            >
                              <i className="bi bi-check-circle me-2"></i>
                              Completed
                              <span className="badge bg-success ms-2">
                                {allBookings.filter(b => b.status === 'completed').length}
                              </span>
                            </button>
                          </li>
                        </ul>
                      </div>

                      {/* Search */}
                      <div className="col-md-6">
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search by patient name, test, or booking ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="row">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mb-0">Loading bookings...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="row">
                <div className="col-12">
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Table Card */}
            {!loading && !error && (
              <div className="row">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="px-4 py-3">Booking ID</th>
                              <th className="py-3">Patient Name</th>
                              <th className="py-3">Test Name</th>
                              <th className="py-3">Date & Time</th>
                              <th className="py-3">Price (₹)</th>
                              <th className="py-3">Status</th>
                              <th className="py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBookings.length > 0 ? (
                              filteredBookings.map((booking) => {
                                const patientName = booking.patientNameSnapshot || booking.patientInfo?.fullName || 'N/A';
                                const price = booking.payment?.amount || 'N/A';
                                const displayId = booking.bookingId || booking.id;

                                return (
                                  <tr key={booking.id}>
                                    <td className="px-4 py-3">
                                      <span className="fw-semibold text-primary">{displayId}</span>
                                    </td>
                                    <td className="py-3">
                                      <div className="d-flex align-items-center">
                                        <div className="avatar-circle bg-primary text-white me-2">
                                          {patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <span className="fw-semibold">{patientName}</span>
                                      </div>
                                    </td>
                                    <td className="py-3">
                                      <div>
                                        <div className="text-dark">{booking.testName || 'N/A'}</div>
                                      </div>
                                    </td>
                                    <td className="py-3">
                                      <div>
                                        <div className="text-dark">
                                          <i className="bi bi-calendar3 me-1"></i>
                                          {booking.testDate || 'N/A'}
                                        </div>
                                        <small className="text-muted">
                                          <i className="bi bi-clock me-1"></i>
                                          {booking.testTime || 'N/A'}
                                        </small>
                                      </div>
                                    </td>
                                    <td className="py-3">
                                      <span className="fw-semibold">
                                        {typeof price === 'number' ? `₹${price}` : price}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      {booking.status === 'pending' ? (
                                        <span className="badge bg-warning text-dark">
                                          <i className="bi bi-hourglass-split me-1"></i>
                                          Pending
                                        </span>
                                      ) : (
                                        <span className="badge bg-success">
                                          <i className="bi bi-check-circle me-1"></i>
                                          Completed
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 text-center">
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
                              })
                            ) : (
                              <tr>
                                <td colSpan="7" className="text-center py-5">
                                  <div className="text-muted">
                                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                    <p className="mb-0">No {activeTab} bookings found</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
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

export default LabBookings;
