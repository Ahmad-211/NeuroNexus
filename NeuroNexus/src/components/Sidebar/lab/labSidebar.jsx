import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import './labSidebar.css';

function LabSidebar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, getNotifications, logout } = useFirebase();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (currentUser) {
        const result = await getNotifications(currentUser.uid, 'lab');
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

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === '/lab/dashboard') return 'dashboard';
    if (path.startsWith('/lab/tests')) return 'tests';
    if (path.startsWith('/lab/bookings')) return 'bookings';
    if (path.startsWith('/lab/reports')) return 'reports';
    if (path.startsWith('/lab/payments')) return 'payments';
    if (path.startsWith('/lab/complaints')) return 'complaints';
    if (path.startsWith('/lab/notifications')) return 'notifications';
    if (path.startsWith('/lab/profile')) return 'profile';
    if (path.startsWith('/lab/settings')) return 'settings';
    return 'dashboard';
  };

  const activeMenu = getActiveMenu();

  const handleLogout = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      localStorage.removeItem('labToken');
      navigate('/lab/login');
    }
  };

  return (
    <>
      <nav className={`lab-sidebar bg-dark text-white p-3 ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header mb-4">
          <div className="d-flex align-items-center gap-2">
            <div className="logo-icon" style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #1a1a1a 0%, #1a1a1a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" style={{ width: '32px', height: '32px' }} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">NeuroNexus</h5>
              <small className="text-white-50">Lab Portal</small>
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
                onClick={(e) => { e.preventDefault(); navigate('/lab/dashboard'); closeSidebar(); }}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </a>
            </li>

            {/* Tests */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'tests' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/tests'); closeSidebar(); }}
              >
                <i className="bi bi-heart-pulse"></i>
                <span>Tests</span>
              </a>
            </li>

            {/* Bookings */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'bookings' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/bookings'); closeSidebar(); }}
              >
                <i className="bi bi-calendar-check"></i>
                <span>Bookings</span>
                <span className="badge badge-bookings ms-auto">8</span>
              </a>
            </li>

            {/* Reports */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'reports' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/reports'); closeSidebar(); }}
              >
                <i className="bi bi-file-earmark-medical"></i>
                <span>Reports</span>
              </a>
            </li>

            {/* Payments */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'payments' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/payments'); closeSidebar(); }}
              >
                <i className="bi bi-credit-card"></i>
                <span>Payments</span>
              </a>
            </li>

            {/* Submit Complaint */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'complaints' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/complaints'); closeSidebar(); }}
              >
                <i className="bi bi-exclamation-triangle"></i>
                <span>Submit Complaint</span>
              </a>
            </li>

        
            {/* Notifications */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'notifications' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/notifications'); closeSidebar(); }}
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

                 {/* Divider */}
            <li className="nav-item my-3">
              <hr className="text-muted" />
            </li>


            {/* Profile */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'profile' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/profile'); closeSidebar(); }}
              >
                <i className="bi bi-person-circle"></i>
                <span>Profile</span>
              </a>
            </li>

            {/* Settings */}
            <li className="nav-item mb-2">
              <a
                href="#"
                className={`nav-link ${activeMenu === 'settings' ? 'active' : ''} text-white d-flex align-items-center gap-2`}
                onClick={(e) => { e.preventDefault(); navigate('/lab/settings'); closeSidebar(); }}
              >
                <i className="bi bi-gear"></i>
                <span>Settings</span>
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

export default LabSidebar;
