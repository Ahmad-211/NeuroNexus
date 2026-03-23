import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import './LabNotifications.css';

function LabNotifications() {
  const { currentUser, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications, deleteNotification } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser.uid) {
        setLoading(false);
        return;
      }
      
      const result = await getNotifications(currentUser.uid, 'lab');
      
      if (result.success) {
        // Map Firebase notifications to UI format
        const mappedNotifications = result.notifications.map(notif => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: notif.read || false,
          timestamp: new Date(notif.timestamp).toISOString(),
          icon: getNotificationIcon(notif.type),
          color: getNotificationColor(notif.type),
          data: notif.data
        }));
        
        setNotifications(mappedNotifications);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  }, [currentUser, getNotifications]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [currentUser, fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'TEST_ADDED':
        return 'bi-plus-circle';
      case 'TEST_UPDATED':
        return 'bi-pencil-square';
      case 'TEST_REMOVED':
        return 'bi-x-circle';
      case 'COMPLAINT_RESPONSE':
        return 'bi-reply-fill';
      default:
        return 'bi-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'TEST_ADDED':
        return 'success';
      case 'TEST_UPDATED':
        return 'info';
      case 'TEST_REMOVED':
        return 'danger';
      case 'COMPLAINT_RESPONSE':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead(currentUser.uid, 'lab');
    if (result.success) {
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
      );
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      const result = await clearAllNotifications(currentUser.uid, 'lab');
      if (result.success) {
        setNotifications([]);
      }
    }
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
        <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column">
          <LabNavbar toggleSidebar={toggleSidebar} />
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
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <div className="flex-grow-1 d-flex flex-column">
        <LabNavbar toggleSidebar={toggleSidebar} />
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

export default LabNotifications;
