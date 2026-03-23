import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './Notifications.css';

function Notifications() {
  const navigate = useNavigate();
  const { currentUser, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications, deleteNotification } = useFirebase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('=== ADMIN NOTIFICATIONS FETCH START ===');
      console.log('Fetching notifications for admin, currentUser:', currentUser);
      console.log('Admin UID:', currentUser?.uid);
      
      if (!currentUser || !currentUser.uid) {
        console.error('No currentUser or UID found!');
        setLoading(false);
        return;
      }
      
      const result = await getNotifications(currentUser.uid, 'admin');
      console.log('Notifications result:', result);
      
      if (result.success) {
        console.log('Number of notifications:', result.notifications?.length || 0);
        console.log('Raw notifications:', result.notifications);
        
        // Map Firebase notifications to UI format
        const mappedNotifications = result.notifications.map(notif => {
          console.log('Mapping notification:', notif);
          return {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            isRead: notif.read || false,
            timestamp: new Date(notif.timestamp).toISOString(),
            icon: getNotificationIcon(notif.type),
            color: getNotificationColor(notif.type),
            data: notif.data
          };
        });
        
        console.log('Mapped notifications:', mappedNotifications);
        console.log('Setting notifications state with', mappedNotifications.length, 'items');
        setNotifications(mappedNotifications);
        console.log('=== ADMIN NOTIFICATIONS FETCH END ===');
      } else {
        console.error('Failed to fetch notifications:', result.error);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  }, [currentUser, getNotifications]);

  useEffect(() => {
    console.log('Notifications useEffect triggered');
    console.log('currentUser:', currentUser);
    if (currentUser) {
      console.log('currentUser exists, fetching notifications');
      fetchNotifications();
    } else {
      console.log('currentUser is null/undefined');
      setLoading(false);
    }
  }, [currentUser, fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'NEW_LAB_REGISTRATION':
        return 'bi-buildings';
      case 'NEW_DOCTOR_REGISTRATION':
        return 'bi-person-plus';
      case 'REGISTRATION_ACTION':
        return 'bi-check-circle';
      case 'NEW_COMPLAINT':
        return 'bi-exclamation-triangle';
      case 'COMPLAINT_RESPONSE':
        return 'bi-reply-fill';
      case 'TEST_ADDED':
      case 'TEST_UPDATED':
      case 'TEST_REMOVED':
        return 'bi-file-medical';
      default:
        return 'bi-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'NEW_LAB_REGISTRATION':
      case 'NEW_DOCTOR_REGISTRATION':
        return 'primary';
      case 'REGISTRATION_ACTION':
        return 'success';
      case 'NEW_COMPLAINT':
        return 'warning';
      case 'COMPLAINT_RESPONSE':
        return 'info';
      case 'TEST_ADDED':
        return 'info';
      case 'TEST_UPDATED':
        return 'secondary';
      case 'TEST_REMOVED':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await markNotificationAsRead(notificationId, currentUser.uid);
    if (result.success) {
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead(currentUser.uid, 'admin');
    if (result.success) {
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
      );
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      const result = await clearAllNotifications(currentUser.uid, 'admin');
      if (result.success) {
        setNotifications([]);
      }
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      const result = await deleteNotification(notificationId, currentUser.uid);
      if (result.success) {
        setNotifications(prevNotifications =>
          prevNotifications.filter(notif => notif.id !== notificationId)
        );
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="flex-grow-1 d-flex flex-column">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-grow-1 overflow-y-auto">
            <div className="w-100 p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4 notifications-page">
            {/* Header */}
            <div className="page-header mb-4">
              <div>
                <h2 className="page-title mb-2">
                  <i className="bi bi-bell-fill text-primary me-2"></i>
                  Notifications
                </h2>
                <p className="page-subtitle text-muted mb-0">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {unreadCount > 0 && (
                  <button className="btn btn-primary" onClick={handleMarkAllAsRead}>
                    <i className="bi bi-check-all me-2"></i> Mark All as Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button className="btn btn-outline-danger" onClick={handleClearAll}>
                    <i className="bi bi-trash me-2"></i> Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs mb-4">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </button>
              <button 
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
              <button 
                className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-bell-slash display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No notifications</h5>
                  <p className="text-muted mb-0">
                    {filter === 'unread' ? 'You have no unread notifications' : 
                     filter === 'read' ? 'You have no read notifications' : 
                     'You have no notifications at this time'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                  >
                    <div className="notification-icon-wrapper">
                      <div className={`notification-icon bg-${notification.color}`}>
                        <i className={notification.icon}></i>
                      </div>
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-header">
                        <h6 className="notification-title">{notification.title}</h6>
                        {!notification.isRead && (
                          <span className="unread-badge"></span>
                        )}
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-footer">
                        <span className="notification-time">
                          <i className="bi bi-clock me-1"></i>
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        <div className="notification-actions">
                          {!notification.isRead && (
                            <button 
                              className="action-btn"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <i className="bi bi-check2"></i>
                            </button>
                          )}
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Notifications;
