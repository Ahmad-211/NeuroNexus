import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './AdminDashboard.css';

function AdminDashboard() {
  const { getAllLabs, getAllDoctors, getAllComplaints } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  const [stats, setStats] = useState({
    totalLabs: 0,
    pendingLabApprovals: 0,
    totalDoctors: 0,
    pendingDoctorApprovals: 0,
    totalComplaints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    setTodayDate(today);
    fetchDashboardStats();
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

      setStats({
        totalLabs,
        pendingLabApprovals,
        totalDoctors,
        pendingDoctorApprovals,
        totalComplaints
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
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
                <button className="btn btn-primary btn-sm me-2">
                  <i className="bi bi-download me-1"></i> Export Report
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-calendar me-1"></i> {todayDate}
                </button>
              </div>
            </div>

            {/* Stats Cards Row 1 */}
            <div className="row g-3 mb-4">
              {/* Total Labs */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Labs</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.totalLabs}</h3>
                      <small className="text-muted">Registered labs</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#dbeafe', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-buildings-fill" style={{fontSize: '28px', color: '#3b82f6'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Lab Approvals */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Pending Approvals</p>
                      <h3 className="mb-0 fw-bold text-warning">{loading ? '...' : stats.pendingLabApprovals}</h3>
                      <small className="text-danger">{stats.pendingLabApprovals > 0 ? <><i className="bi bi-exclamation-circle"></i> Needs action</> : 'No pending labs'}</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fef3c7', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-hourglass-split" style={{fontSize: '28px', color: '#f59e0b'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Doctors */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Doctors</p>
                      <h3 className="mb-0 fw-bold text-dark">{loading ? '...' : stats.totalDoctors}</h3>
                      <small className="text-muted">Registered doctors</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1FADF', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-heart-pulse-fill" style={{fontSize: '28px', color: '#10b981'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Doctor Approvals */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Doctor Approvals</p>
                      <h3 className="mb-0 fw-bold text-danger">{loading ? '...' : stats.pendingDoctorApprovals}</h3>
                      <small className="text-danger">{stats.pendingDoctorApprovals > 0 ? <><i className="bi bi-exclamation-circle"></i> Pending review</> : 'No pending doctors'}</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fee2e2', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-clock-history" style={{fontSize: '28px', color: '#ef4444'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards Row 2 */}
            <div className="row g-3 mb-4">
              {/* Total Patients */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Patients</p>
                      <h3 className="mb-0 fw-bold text-dark">892</h3>
                      <small className="text-success"><i className="bi bi-arrow-up"></i> +25% from last month</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#dbeafe', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-people-fill" style={{fontSize: '28px', color: '#3b82f6'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Patients */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Active Patients</p>
                      <h3 className="mb-0 fw-bold text-dark">654</h3>
                      <small className="text-success"><i className="bi bi-arrow-up"></i> +18% from last month</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#dbeafe', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-person-check-fill" style={{fontSize: '28px', color: '#3b82f6'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Bookings */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Bookings</p>
                      <h3 className="mb-0 fw-bold text-dark">342</h3>
                      <small className="text-success"><i className="bi bi-arrow-up"></i> +15% from last month</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#e0e7ff', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-calendar-check-fill" style={{fontSize: '28px', color: '#6366f1'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Bookings */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Completed</p>
                      <h3 className="mb-0 fw-bold text-dark">287</h3>
                      <small className="text-success"><i className="bi bi-arrow-up"></i> +20% from last month</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1FADF', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-check-circle-fill" style={{fontSize: '28px', color: '#10b981'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards Row 3 */}
            <div className="row g-3 mb-4">
              {/* Total Payments */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Payments</p>
                      <h3 className="mb-0 fw-bold text-dark">342</h3>
                      <small className="text-success"><i className="bi bi-arrow-up"></i> +15% from last month</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1F7E3', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-cash-stack" style={{fontSize: '28px', color: '#059669'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paid Payments */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Paid</p>
                      <h3 className="mb-0 fw-bold text-dark">328</h3>
                      <small className="text-success"><i className="bi bi-arrow-up"></i> +18% from last month</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1FADF', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-currency-rupee" style={{fontSize: '28px', color: '#10b981'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h3 className="mb-0 fw-bold text-dark">₹1.2M</h3>
                      <small className="text-success"><i className="bi bi-arrow-up"></i> +22% from last month</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#D1F7E3', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-graph-up-arrow" style={{fontSize: '28px', color: '#059669'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaints */}
              <div className="col-md-6 col-lg-3">
                <div className="stat-card bg-white border-0 rounded-lg p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Complaints</p>
                      <h3 className="mb-0 fw-bold text-warning">{loading ? '...' : stats.totalComplaints}</h3>
                      <small className="text-muted">Filed complaints</small>
                    </div>
                    <div className="icon-bg rounded-lg p-3" style={{backgroundColor: '#fef3c7', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-exclamation-triangle-fill" style={{fontSize: '28px', color: '#f59e0b'}}></i>
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
                        <tr>
                          <td><i className="bi bi-buildings text-primary me-2"></i> Lab Registered</td>
                          <td>Diagnostic Lab XYZ</td>
                          <td><span className="badge bg-warning">Pending</span></td>
                          <td>2 hours ago</td>
                        </tr>
                        <tr>
                          <td><i className="bi bi-person-doctor text-success me-2"></i> Doctor Approved</td>
                          <td>Dr. Rajesh Kumar</td>
                          <td><span className="badge bg-success">Approved</span></td>
                          <td>5 hours ago</td>
                        </tr>
                        <tr>
                          <td><i className="bi bi-credit-card text-info me-2"></i> Payment Received</td>
                          <td>Patient ID: #5823</td>
                          <td><span className="badge bg-success">Completed</span></td>
                          <td>1 day ago</td>
                        </tr>
                        <tr>
                          <td><i className="bi bi-exclamation-triangle text-danger me-2"></i> Complaint Filed</td>
                          <td>Patient ID: #5901</td>
                          <td><span className="badge bg-danger">Open</span></td>
                          <td>1 day ago</td>
                        </tr>
                        <tr>
                          <td><i className="bi bi-people text-secondary me-2"></i> New Patient</td>
                          <td>Anjali Sharma</td>
                          <td><span className="badge bg-info">Registered</span></td>
                          <td>2 days ago</td>
                        </tr>
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
