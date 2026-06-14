import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import LabAppealAlerts from './LabAppealAlerts';
import './AdminDashboard.css';

function AdminDashboard() {
  const { getAllLabs, getAllDoctors, getAllComplaints, getAllPatients, getAllBookings, getRecentActivities, getAllPayments } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalLabs: 0,
    pendingLabApprovals: 0,
    totalDoctors: 0,
    pendingDoctorApprovals: 0,
    totalComplaints: 0,
    totalPatients: 0,
    activePatients: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalPayments: 0,
    paidPayments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    setTodayDate(today);
    fetchDashboardStats();
    fetchActivities();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all labs
      const labsResult = await getAllLabs();
      const labs = labsResult.success ? labsResult.labs : [];
      const totalLabs = labs.length;
      const pendingLabApprovals = labs.filter(lab => lab.registrationStatus === 'pending').length;

      // Fetch all doctors
      const doctorsResult = await getAllDoctors();
      const doctors = doctorsResult.success ? doctorsResult.doctors : [];
      const totalDoctors = doctors.length;
      const pendingDoctorApprovals = doctors.filter(doctor => doctor.registrationStatus === 'pending').length;

      // Fetch all complaints
      const complaintsResult = await getAllComplaints();
      const complaints = complaintsResult.success ? complaintsResult.complaints : [];
      const totalComplaints = complaints.length;

      // Fetch all patients
      const patientsResult = await getAllPatients();
      const patients = patientsResult.success ? patientsResult.patients : [];
      const totalPatients = patients.length;
      const activePatients = patients.filter(patient => patient.status === 'active').length;

      // Fetch all bookings
      const bookingsResult = await getAllBookings();
      const bookings = bookingsResult.success ? bookingsResult.bookings : [];
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(booking => booking.status === 'completed').length;

      // Fetch all payments
      const paymentsResult = await getAllPayments();
      const payments = paymentsResult.success ? paymentsResult.payments : [];
      const totalPayments = payments.length;
      const paidPayments = payments.filter(p => p.status === 'paid').length;
      const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.isInstallment ? p.paidAmount : p.amount), 0);

      setStats({
        totalLabs,
        pendingLabApprovals,
        totalDoctors,
        pendingDoctorApprovals,
        totalComplaints,
        totalPatients,
        activePatients,
        totalBookings,
        completedBookings,
        totalPayments,
        paidPayments,
        totalRevenue
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    const result = await getRecentActivities();
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Dashboard" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">Welcome back, Admin!</h2>
                <p className="text-muted mb-0">Here's what's happening in your healthcare system today.</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-calendar me-1"></i> {todayDate}
                </button>
              </div>
            </div>

            {/* Stats Cards Row 1 */}
            <div className="row g-3 mb-4">
              {/* Total Labs */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Labs</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.totalLabs}</h3>
                      <small className="text-muted">Registered labs</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#dbeafe'}}>
                      <i className="bi bi-buildings-fill" style={{color: '#3b82f6'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Lab Approvals */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Pending Approvals</p>
                      <h3 className="mb-0 fw-bold text-warning">{loading ? '...' : stats.pendingLabApprovals}</h3>
                      <small className="text-danger">{stats.pendingLabApprovals > 0 ? <><i className="bi bi-exclamation-circle"></i> Needs action</> : 'No pending labs'}</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fef3c7'}}>
                      <i className="bi bi-hourglass-split" style={{color: '#f59e0b'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Doctors */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Doctors</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.totalDoctors}</h3>
                      <small className="text-muted">Registered doctors</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1FADF'}}>
                      <i className="bi bi-heart-pulse-fill" style={{color: '#10b981'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Doctor Approvals */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Doctor Approvals</p>
                      <h3 className="mb-0 fw-bold text-danger">{loading ? '...' : stats.pendingDoctorApprovals}</h3>
                      <small className="text-danger">{stats.pendingDoctorApprovals > 0 ? <><i className="bi bi-exclamation-circle"></i> Pending review</> : 'No pending doctors'}</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fee2e2'}}>
                      <i className="bi bi-clock-history" style={{color: '#ef4444'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards Row 2 */}
            <div className="row g-3 mb-4">
              {/* Total Patients */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Patients</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.totalPatients}</h3>

                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#dbeafe'}}>
                      <i className="bi bi-people-fill" style={{color: '#3b82f6'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Patients */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Active Patients</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.activePatients}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#dbeafe'}}>
                      <i className="bi bi-person-check-fill" style={{color: '#3b82f6'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Bookings */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Bookings</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.totalBookings}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#e0e7ff'}}>
                      <i className="bi bi-calendar-check-fill" style={{color: '#6366f1'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Bookings */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Completed</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.completedBookings}</h3>

                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1FADF'}}>
                      <i className="bi bi-check-circle-fill" style={{color: '#10b981'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards Row 3 */}
            <div className="row g-3 mb-4">
              {/* Total Payments */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Payments</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.totalPayments}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1F7E3'}}>
                      <i className="bi bi-cash-stack" style={{color: '#059669'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paid Payments */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Paid</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.paidPayments}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1FADF'}}>
                      <i className="bi bi-currency-dollar" style={{color: '#10b981'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1F7E3'}}>
                      <i className="bi bi-graph-up-arrow" style={{color: '#059669'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaints */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Complaints</p>
                      <h3 className="mb-0 fw-bold text-warning">{loading ? '...' : stats.totalComplaints}</h3>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fef3c7'}}>
                      <i className="bi bi-exclamation-triangle-fill" style={{color: '#f59e0b'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lab Appeal Alerts */}
            <div className="row g-3 mt-2">
              <div className="col-12">
                <LabAppealAlerts />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="row g-3 mt-2">
              <div className="col-12">
                <div className="activity-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-0 fw-bold">Recent Activity</h5>
                      <small className="text-muted">Latest updates</small>
                    </div>
                    <a href="#" className="text-primary text-decoration-none small">View all</a>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Event</th>
                          <th>User</th>
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
                              <td><i className={`bi ${act.icon} text-${act.color} me-2`}></i> {act.description}</td>
                              <td>{act.user}</td>
                              <td><span className={`badge bg-${act.statusClass}`}>{act.status}</span></td>
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

export default AdminDashboard;
