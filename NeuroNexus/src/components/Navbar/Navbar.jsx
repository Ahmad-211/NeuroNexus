import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../context/Firebase';
import './Navbar.css';

function Navbar({ toggleSidebar, pageTitle }) {
  const navigate = useNavigate();
  const { currentUser, getAdminProfile, getNotifications, logout } = useFirebase();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchAdminData();
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    const result = await getAdminProfile(currentUser.uid);
    if (result.success) setAdminData(result.admin);
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('Admin Navbar: Fetching unread count for user:', currentUser.uid);
      const result = await getNotifications(currentUser.uid, 'admin');
      console.log('Admin Navbar: Got notifications result:', result);
      if (result.success) {
        const count = result.notifications.filter(n => !n.read).length;
        console.log('Admin Navbar: Unread count:', count);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Section */}
        <div className="navbar-left">
          <button 
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            <i className="bi bi-list"></i>
          </button>
          
          <div className="navbar-brand">
            <div className="navbar-logo">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" style={{ width: '32px', height: '32px' }} />
            </div>
            <div className="navbar-info">
              <span className="navbar-title">NeuroNexus Admin</span>
              {pageTitle && <span className="navbar-page">{pageTitle}</span>}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Notifications */}
          <button 
            className="navbar-icon-btn" 
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {/* Profile Dropdown */}
          <div className="profile-dropdown">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {adminData?.profilePicUrl ? (
                  <img
                    src={adminData.profilePicUrl}
                    alt={adminData.name || 'Admin'}
                    className="admin-avatar-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <i className="bi bi-person-circle" style={{ display: adminData?.profilePicUrl ? 'none' : 'flex' }}></i>
              </div>
              <div className="profile-info">
                <span className="profile-name">{adminData?.name || 'Admin'}</span>
                <span className="profile-role">Administrator</span>
              </div>
              <i className="bi bi-chevron-down"></i>
            </button>

            {showProfileMenu && (
              <div className="profile-menu">
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setShowProfileMenu(false);
                  }} 
                  className="profile-menu-item"
                >
                  <i className="bi bi-person-circle"></i>
                  My Profile
                </button>
                <button onClick={handleLogout} className="profile-menu-item logout">
                  <i className="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;