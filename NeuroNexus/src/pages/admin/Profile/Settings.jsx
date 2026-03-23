import { useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './Settings.css';

function Settings() {
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@neuronexus.com',
    phone: '+91 98765 43210',
    role: 'Administrator',
    address: 'Mumbai, Maharashtra, India'
  });

  // Email Preferences State
  const [emailPreferences, setEmailPreferences] = useState({
    newRegistrations: true,
    paymentAlerts: true,
    complaints: true,
    systemUpdates: false,
    weeklyReports: true,
    monthlyReports: false
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true
  });

  // Theme State
  const [theme, setTheme] = useState('light');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailPrefChange = (key) => {
    setEmailPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      // TODO: Update profile in Firebase
      showSuccess('Success!', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Error!', 'Failed to update profile.');
    }
  };

  const handleSavePreferences = async () => {
    try {
      // TODO: Update preferences in Firebase
      showSuccess('Success!', 'Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showError('Error!', 'Failed to save preferences.');
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // TODO: Apply theme to entire application
    document.body.className = `theme-${newTheme}`;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Settings" />
        <main className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4 settings-page">
            {/* Header */}
            <div className="page-header mb-4">
              <div>
                <h2 className="page-title mb-2">
                  <i className="bi bi-gear-fill text-primary me-2"></i>
                  Settings
                </h2>
                <p className="page-subtitle text-muted mb-0">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="settings-tabs mb-4">
              <button 
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person me-2"></i> Profile
              </button>
              <button 
                className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
              >
                <i className="bi bi-envelope me-2"></i> Email Preferences
              </button>
              <button 
                className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="bi bi-bell me-2"></i> Notifications
              </button>
              <button 
                className={`tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
                onClick={() => setActiveTab('theme')}
              >
                <i className="bi bi-palette me-2"></i> Theme
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0"><i className="bi bi-person-circle me-2"></i>Profile Information</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSaveProfile}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Role</label>
                        <input
                          type="text"
                          className="form-control"
                          name="role"
                          value={profileData.role}
                          disabled
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Address</label>
                        <textarea
                          className="form-control"
                          name="address"
                          rows="3"
                          value={profileData.address}
                          onChange={handleProfileChange}
                        ></textarea>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check-circle me-2"></i> Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Email Preferences Tab */}
            {activeTab === 'email' && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0"><i className="bi bi-envelope-check me-2"></i>Email Preferences</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">Choose which emails you'd like to receive</p>
                  
                  <div className="preference-list">
                    <div className="preference-item">
                      <div>
                        <div className="preference-title">New Registrations</div>
                        <div className="preference-desc">Get notified when new labs or doctors register</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={emailPreferences.newRegistrations}
                          onChange={() => handleEmailPrefChange('newRegistrations')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">Payment Alerts</div>
                        <div className="preference-desc">Receive alerts for all payment transactions</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={emailPreferences.paymentAlerts}
                          onChange={() => handleEmailPrefChange('paymentAlerts')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">Complaints</div>
                        <div className="preference-desc">Get notified about new complaints</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={emailPreferences.complaints}
                          onChange={() => handleEmailPrefChange('complaints')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">System Updates</div>
                        <div className="preference-desc">Important system updates and announcements</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={emailPreferences.systemUpdates}
                          onChange={() => handleEmailPrefChange('systemUpdates')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">Weekly Reports</div>
                        <div className="preference-desc">Summary of weekly activities and statistics</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={emailPreferences.weeklyReports}
                          onChange={() => handleEmailPrefChange('weeklyReports')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">Monthly Reports</div>
                        <div className="preference-desc">Detailed monthly performance reports</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={emailPreferences.monthlyReports}
                          onChange={() => handleEmailPrefChange('monthlyReports')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button className="btn btn-primary" onClick={handleSavePreferences}>
                      <i className="bi bi-check-circle me-2"></i> Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0"><i className="bi bi-bell-fill me-2"></i>Notification Settings</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">Control how you receive notifications</p>
                  
                  <div className="preference-list">
                    <div className="preference-item">
                      <div>
                        <div className="preference-title">Push Notifications</div>
                        <div className="preference-desc">Receive push notifications in browser</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={notificationSettings.pushNotifications}
                          onChange={() => handleNotificationChange('pushNotifications')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">Email Notifications</div>
                        <div className="preference-desc">Receive notifications via email</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={() => handleNotificationChange('emailNotifications')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">SMS Notifications</div>
                        <div className="preference-desc">Receive critical alerts via SMS</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={() => handleNotificationChange('smsNotifications')}
                        />
                      </div>
                    </div>

                    <div className="preference-item">
                      <div>
                        <div className="preference-title">Desktop Notifications</div>
                        <div className="preference-desc">Show notifications on desktop</div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={notificationSettings.desktopNotifications}
                          onChange={() => handleNotificationChange('desktopNotifications')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button className="btn btn-primary" onClick={handleSavePreferences}>
                      <i className="bi bi-check-circle me-2"></i> Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0"><i className="bi bi-palette-fill me-2"></i>Theme Preferences</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-4">Choose your preferred color theme</p>
                  
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div 
                        className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('light')}
                      >
                        <div className="theme-preview theme-light">
                          <div className="theme-preview-header"></div>
                          <div className="theme-preview-body">
                            <div className="theme-preview-sidebar"></div>
                            <div className="theme-preview-content"></div>
                          </div>
                        </div>
                        <div className="theme-info">
                          <div className="theme-name">Light</div>
                          <div className="theme-desc">Clean and bright</div>
                        </div>
                        {theme === 'light' && (
                          <div className="theme-check">
                            <i className="bi bi-check-circle-fill"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div 
                        className={`theme-card ${theme === 'grey' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('grey')}
                      >
                        <div className="theme-preview theme-grey">
                          <div className="theme-preview-header"></div>
                          <div className="theme-preview-body">
                            <div className="theme-preview-sidebar"></div>
                            <div className="theme-preview-content"></div>
                          </div>
                        </div>
                        <div className="theme-info">
                          <div className="theme-name">Grey</div>
                          <div className="theme-desc">Professional and modern</div>
                        </div>
                        {theme === 'grey' && (
                          <div className="theme-check">
                            <i className="bi bi-check-circle-fill"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div 
                        className={`theme-card ${theme === 'blue' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('blue')}
                      >
                        <div className="theme-preview theme-blue">
                          <div className="theme-preview-header"></div>
                          <div className="theme-preview-body">
                            <div className="theme-preview-sidebar"></div>
                            <div className="theme-preview-content"></div>
                          </div>
                        </div>
                        <div className="theme-info">
                          <div className="theme-name">Blue</div>
                          <div className="theme-desc">Cool and calming</div>
                        </div>
                        {theme === 'blue' && (
                          <div className="theme-check">
                            <i className="bi bi-check-circle-fill"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info mt-4">
                    <i className="bi bi-info-circle me-2"></i>
                    Theme changes will be applied immediately across all pages.
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
      />
    </div>
  );
}

export default Settings;
