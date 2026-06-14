import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import './LabDashboard.css';

function LabDashboard() {
  const navigate = useNavigate();
  const { getLabTests, getLabBookings, getLabRecentActivities, currentUser } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  const [totalTests, setTotalTests] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [activities, setActivities] = useState([]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleViewBooking = (bookingId) => {
    navigate(`/lab/bookings/${bookingId}`);
  };

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    setTodayDate(today);
  }, []);

  // Fetch total tests count
  // Fetch total tests and bookings count
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!currentUser) return;

      try {
        // Fetch Tests
        const testsResult = await getLabTests(currentUser.uid);
        if (testsResult.success && testsResult.tests) {
          setTotalTests(testsResult.tests.length);
        }

        // Fetch Bookings
        const bookingsResult = await getLabBookings(currentUser.uid);
        if (bookingsResult.success && bookingsResult.bookings) {
          const bookings = bookingsResult.bookings;
          
          let pendingCount = 0;
          let completedCount = 0;
          let todayCount = 0;
          
          // Use YYYY-MM-DD to check strings easily
          const todayStr = new Date().toISOString().split('T')[0];
          const todayDateObj = new Date();

          bookings.forEach(booking => {
            if (booking.status === 'pending') {
              pendingCount++;
            } else if (booking.status === 'completed') {
              completedCount++;
            }
            
            const bDate = booking.testDate || booking.selectedDate || booking.date;
            if (bDate) {
              if (bDate === todayStr || new Date(bDate).toDateString() === todayDateObj.toDateString()) {
                todayCount++;
              }
            }
          });

          setPendingBookings(pendingCount);
          setCompletedBookings(completedCount);
          setTodaysAppointments(todayCount);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
    fetchActivities();
  }, [currentUser, getLabTests, getLabBookings]);

  const fetchActivities = async () => {
    if (!currentUser) return;
    const result = await getLabRecentActivities(currentUser.uid);
    if (result.success) {
      setActivities(result.activities);
    }
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge bg-warning">Pending</span>;
      case 'confirmed': return <span className="badge bg-info">Confirmed</span>;
      case 'completed': return <span className="badge bg-success">Completed</span>;
      case 'cancelled': return <span className="badge bg-danger">Cancelled</span>;
      case 'shared': return <span className="badge bg-success">Shared</span>;
      case 'open': return <span className="badge bg-danger">Open</span>;
      case 'resolved': return <span className="badge bg-success">Resolved</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Dashboard" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">Welcome back, Lab Admin!</h2>
                <p className="text-muted mb-0">Here's what's happening in your laboratory today.</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-calendar me-1"></i> {todayDate}
                </button>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="row g-3 mb-4">
              {/* Total Tests */}
              <div className="col-md-6 col-lg-4">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Tests</p>
                      <h3 className="mb-0 fw-bold text-dark">{totalTests}</h3>
                      <small className="text-muted"><i className="bi bi-beaker"></i> Available tests</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#dbeafe', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-heart-pulse-fill" style={{fontSize: '28px', color: '#3b82f6'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Bookings */}
              <div className="col-md-6 col-lg-4">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Pending Bookings</p>
                      <h3 className="mb-0 fw-bold text-warning">{pendingBookings}</h3>
                      <small className="text-danger"><i className="bi bi-exclamation-circle"></i> Needs attention</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fef3c7', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-hourglass-split" style={{fontSize: '28px', color: '#f59e0b'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Bookings */}
              <div className="col-md-6 col-lg-4">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Completed Bookings</p>
                      <h3 className="mb-0 fw-bold text-dark">{completedBookings}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1FADF', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-check-circle-fill" style={{fontSize: '28px', color: '#10b981'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="col-md-6 col-lg-4">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Today's Appointments</p>
                      <h3 className="mb-0 fw-bold text-dark">{todaysAppointments}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#e0e7ff', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-calendar-check-fill" style={{fontSize: '28px', color: '#6366f1'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Payments */}
              <div className="col-md-6 col-lg-4">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Payments</p>
                      <h3 className="mb-0 fw-bold text-dark">₹3.2L</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1F7E3', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-cash-stack" style={{fontSize: '28px', color: '#059669'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Tests */}
              <div className="col-md-6 col-lg-4">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Active Tests</p>
                      <h3 className="mb-0 fw-bold text-dark">{totalTests}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fce7f3', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-activity" style={{fontSize: '28px', color: '#ec4899'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="row g-3 mt-2">
              <div className="col-12">
                <div className="activity-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-0 fw-bold">Recent Activity</h5>
                      <small className="text-muted">Latest test bookings and updates</small>
                    </div>
                    <a href="#" className="text-primary text-decoration-none small">View all</a>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>User</th>
                          <th>Test Type</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-4">No recent activity</td>
                          </tr>
                        ) : (
                          activities.map((act, i) => (
                            <tr key={i}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-circle bg-primary text-white me-2">{getInitials(act.patientName)}</div>
                                  <div>
                                    <div className="fw-semibold">{act.patientName}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{act.testName}</td>
                              <td>{statusBadge(act.status)}</td>
                              <td>{timeAgo(act.timestamp)}</td>
                            </tr>
                          ))
                        )}
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
  );
}

export default LabDashboard;
