import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../context/Firebase';
import './LabNavbar.css';

function LabNavbar({ toggleSidebar, pageTitle }) {
  const navigate = useNavigate();
  const { currentUser, getLabById, getNotifications, logout } = useFirebase();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch lab data on component mount
  useEffect(() => {
    const fetchLabData = async () => {
      if (currentUser) {
        try {
          console.log('Fetching lab data for UID:', currentUser.uid);
          const result = await getLabById(currentUser.uid);
          console.log('Lab data result:', result);
          if (result.success) {
            console.log('Lab profile picture URL:', result.lab.profilePicUrl);
            setLabData(result.lab);
          } else {
            console.error('Failed to fetch lab data:', result.error);
          }
        } catch (error) {
          console.error('Error fetching lab data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No current user found');
      }
    };

    fetchLabData();
  }, [currentUser, getLabById]);

  // Fetch unread notification count
  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    try {
      const result = await getNotifications(currentUser.uid, 'lab');
      if (result.success) {
        const count = result.notifications.filter(n => !n.read).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      localStorage.removeItem('labAuthToken');
      navigate('/lab/login');
    }
  };

  return (
    <nav className="lab-navbar">
      <div className="lab-navbar-container">
        {/* Left Section */}
        <div className="lab-navbar-left">
          <button 
            className="lab-menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            <i className="bi bi-list"></i>
          </button>
          
          <div className="lab-navbar-brand">
            <div className="lab-navbar-logo">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" style={{ width: '32px', height: '32px' }} />
            </div>
            <div className="lab-navbar-info">
              <span className="lab-navbar-title">NeuroNexus Lab</span>
              {pageTitle && <span className="lab-navbar-page">{pageTitle}</span>}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="lab-navbar-right">
          {/* Notifications */}
          <button 
            className="lab-navbar-icon-btn" 
            aria-label="Notifications"
            onClick={() => navigate('/lab/notifications')}
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && <span className="lab-notification-badge">{unreadCount}</span>}
          </button>

          {/* Profile Dropdown */}
          <div className="lab-profile-dropdown">
            <button 
              className="lab-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="lab-profile-avatar">
                {console.log('Rendering avatar, profilePicUrl:', labData?.profilePicUrl)}
                {labData?.profilePicUrl ? (
                  <>
                    <img 
                      src={labData.profilePicUrl} 
                      alt={labData.name || 'Lab Logo'}
                      className="lab-avatar-image"
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => {
                        console.error('Image load error for URL:', labData.profilePicUrl);
                        e.target.style.display = 'none';
                        const icon = e.target.parentElement.querySelector('i');
                        if (icon) icon.style.display = 'flex';
                      }}
                    />
                    <i 
                      className="bi bi-hospital" 
                      style={{ display: 'none' }}
                    ></i>
                  </>
                ) : (
                  <i className="bi bi-hospital"></i>
                )}
              </div>
              <div className="lab-profile-info">
                <span className="lab-profile-name">{labData?.name || 'Loading...'}</span>
                <span className="lab-profile-role">Laboratory</span>
              </div>
              <i className="bi bi-chevron-down"></i>
            </button>

            {showProfileMenu && (
              <div className="lab-profile-menu">
                <button 
                  onClick={() => {
                    navigate('/lab/profile');
                    setShowProfileMenu(false);
                  }} 
                  className="lab-profile-menu-item"
                >
                  <i className="bi bi-person-circle"></i>
                  My Profile
                </button>
                <button 
                  onClick={() => {
                    navigate('/lab/settings');
                    setShowProfileMenu(false);
                  }} 
                  className="lab-profile-menu-item"
                >
                  <i className="bi bi-gear"></i>
                  Settings
                </button>
                <button onClick={handleLogout} className="lab-profile-menu-item logout">
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

export default LabNavbar;
