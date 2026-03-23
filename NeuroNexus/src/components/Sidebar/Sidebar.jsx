import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFirebase } from '../../context/Firebase';
import './Sidebar.css';

function Sidebar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, getNotifications, getAllLabs, getAllDoctors, getAllComplaints, logout } = useFirebase();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingLabsCount, setPendingLabsCount] = useState(0);
  const [pendingDoctorsCount, setPendingDoctorsCount] = useState(0);
  const [unassignedComplaintsCount, setUnassignedComplaintsCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (currentUser) {
        const result = await getNotifications(currentUser.uid, 'admin');
        if (result.success) {
          const unread = result.notifications.filter(notif => !notif.read).length;
          setUnreadCount(unread);
        }
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser, getNotifications]);

  // Fetch pending labs count
  useEffect(() => {
    const fetchPendingLabsCount = async () => {
      const result = await getAllLabs();
      if (result.success) {
        const pending = result.labs.filter(lab => lab.registrationStatus === 'pending').length;
        setPendingLabsCount(pending);
      }
    };

    fetchPendingLabsCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingLabsCount, 30000);
    return () => clearInterval(interval);
  }, [getAllLabs]);

  // Fetch pending doctors count
  useEffect(() => {
    const fetchPendingDoctorsCount = async () => {
      const result = await getAllDoctors();
      if (result.success) {
        const pending = result.doctors.filter(doctor => doctor.registrationStatus === 'pending').length;
        setPendingDoctorsCount(pending);
      }
    };

    fetchPendingDoctorsCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingDoctorsCount, 30000);
    return () => clearInterval(interval);
  }, [getAllDoctors]);

  // Fetch unassigned complaints count (complaints without priority)
  useEffect(() => {
    const fetchUnassignedComplaintsCount = async () => {
      const result = await getAllComplaints();
      if (result.success) {
        const unassigned = result.complaints.filter(complaint => 
          !complaint.priority || complaint.priority === 'NA'
        ).length;
        setUnassignedComplaintsCount(unassigned);
      }
    };

    fetchUnassignedComplaintsCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnassignedComplaintsCount, 30000);
    return () => clearInterval(interval);
  }, [getAllComplaints]);

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/labs')) return 'labs';
    if (path.startsWith('/doctors')) return 'doctors';
    if (path.startsWith('/patients')) return 'patients';
    if (path.startsWith('/bookings')) return 'bookings';
    if (path.startsWith('/payments')) return 'payments';
    if (path.startsWith('/complaints')) return 'complaints';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeMenu = getActiveMenu();

  const handleLogout = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      localStorage.removeItem('adminToken');
      navigate('/login');
    }
  };

  return (
    <>
      <nav className={`sidebar bg-dark text-white p-3 ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header mb-4">
          <div className="d-flex align-items-center gap-2">
            <div className="logo-icon" style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" style={{ width: '32px', height: '32px' }} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">NeuroNexus</h5>
              <small className="text-white-50">Admin Portal</small>
            </div>
          </div>
          <button 
            className="btn-close btn-close-white d-lg-none ms-auto position-absolute top-0 end-0 me-3 mt-3" 
            onClick={closeSidebar}
            type="button"
          ></button>
        </div>

        <div className="sidebar-menu">
          <ul className="nav flex-column">
            {/* Dashboard */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'dashboard' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/dashboard'); closeSidebar(); }}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </a>
            </li>

            {/* Labs */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'labs' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/labs/pending'); closeSidebar(); }}
              >
                <i className="bi bi-buildings"></i>
                <span>Labs</span>
                {pendingLabsCount > 0 && (
                  <span className="badge badge-labs ms-auto">{pendingLabsCount}</span>
                )}
              </a>
            </li>

            {/* Doctors */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'doctors' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/doctors/pending'); closeSidebar(); }}
              >
                <i className="bi bi-person-circle"></i>
                <span>Doctors</span>
                {pendingDoctorsCount > 0 && (
                  <span className="badge badge-doctors ms-auto">{pendingDoctorsCount}</span>
                )}
              </a>
            </li>

            {/* Patients */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'patients' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/patients'); closeSidebar(); }}
              >
                <i className="bi bi-people"></i>
                <span>Patients</span>
              </a>
            </li>

            {/* Bookings */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'bookings' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/bookings'); closeSidebar(); }}
              >
                <i className="bi bi-calendar-check"></i>
                <span>Bookings</span>
              </a>
            </li>

            {/* Payments */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'payments' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/payments'); closeSidebar(); }}
              >
                <i className="bi bi-credit-card"></i>
                <span>Payments</span>
              </a>
            </li>

            {/* Complaints */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'complaints' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/complaints'); closeSidebar(); }}
              >
                <i className="bi bi-exclamation-triangle"></i>
                <span>Complaints</span>
                {unassignedComplaintsCount > 0 && (
                  <span className="badge badge-complaints ms-auto">{unassignedComplaintsCount}</span>
                )}
              </a>
            </li>

           

            {/* Notifications */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'notifications' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/notifications'); closeSidebar(); }}
              >
                <i className="bi bi-bell"></i>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge badge-notifications ms-auto">{unreadCount}</span>
                )}
              </a>
            </li>

             {/* Divider */}
            <li className="nav-item my-3">
              <hr className="text-muted" />
            </li>


            {/* Settings */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'settings' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/settings'); closeSidebar(); }}
              >
                <i className="bi bi-gear"></i>
                <span>Settings</span>
              </a>
            </li>

            {/* Profile */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'profile' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/profile'); closeSidebar(); }}
              >
                <i className="bi bi-person-circle"></i>
                <span>Profile</span>
              </a>
            </li>

           

            {/* Logout */}
            <li className="nav-item">
              <a
                href="#"
                className="nav-link text-danger d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      {isOpen && <div className="sidebar-overlay show" onClick={closeSidebar}></div>}
    </>
  );
}

export default Sidebar;
