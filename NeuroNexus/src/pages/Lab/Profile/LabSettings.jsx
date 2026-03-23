import { useState } from 'react';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './LabSettings.css';

function LabSettings() {
  const { alert, showSuccess, showInfo, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    systemNotifications: true,
    onlineBooking: true
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleToggle = (settingName) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
  };

  const handleSaveSettings = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showSuccess('Success!', 'Settings saved successfully!');
    }, 1000);
  };

  const handleChangePassword = () => {
    showInfo('Coming Soon', 'Change password functionality will be implemented.');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      showInfo('Coming Soon', 'Account deletion process initiated. This feature will be implemented.');
    }
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Settings" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="mb-1 fw-bold">Settings</h2>
                <p className="text-muted mb-0">Manage your preferences and account settings</p>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-8 mx-auto">
                {/* Notification Settings */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-bell me-2 text-primary"></i>
                      Notification Preferences
                    </h5>
                    <div className="settings-list">
                      {/* Email Notifications */}
                      <div className="setting-item">
                        <div className="setting-info">
                          <div className="setting-title">Email Notifications</div>
                          <div className="setting-description">
                            Receive important updates and alerts via email
                          </div>
                        </div>
                        <div className="setting-control">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="emailNotifications"
                              checked={settings.emailNotifications}
                              onChange={() => handleToggle('emailNotifications')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SMS Notifications */}
                      <div className="setting-item">
                        <div className="setting-info">
                          <div className="setting-title">SMS Notifications</div>
                          <div className="setting-description">
                            Get SMS alerts for critical updates
                          </div>
                        </div>
                        <div className="setting-control">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="smsNotifications"
                              checked={settings.smsNotifications}
                              onChange={() => handleToggle('smsNotifications')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* System Notifications */}
                      <div className="setting-item">
                        <div className="setting-info">
                          <div className="setting-title">System Notifications</div>
                          <div className="setting-description">
                            Display in-app notifications for new activities
                          </div>
                        </div>
                        <div className="setting-control">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="systemNotifications"
                              checked={settings.systemNotifications}
                              onChange={() => handleToggle('systemNotifications')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Settings */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-calendar-check me-2 text-primary"></i>
                      Booking Settings
                    </h5>
                    <div className="settings-list">
                      {/* Online Booking */}
                      <div className="setting-item">
                        <div className="setting-info">
                          <div className="setting-title">Online Booking</div>
                          <div className="setting-description">
                            Allow patients to book tests online through the platform
                          </div>
                        </div>
                        <div className="setting-control">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="onlineBooking"
                              checked={settings.onlineBooking}
                              onChange={() => handleToggle('onlineBooking')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-shield-check me-2 text-primary"></i>
                      Security & Privacy
                    </h5>
                    <div className="settings-list">
                      {/* Change Password */}
                      <div className="setting-item">
                        <div className="setting-info">
                          <div className="setting-title">Change Password</div>
                          <div className="setting-description">
                            Update your account password for better security
                          </div>
                        </div>
                        <div className="setting-control">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleChangePassword}
                          >
                            <i className="bi bi-key me-2"></i>
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="card border-0 shadow-sm border-danger mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold text-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Danger Zone
                    </h5>
                    <div className="settings-list">
                      {/* Delete Account */}
                      <div className="setting-item">
                        <div className="setting-info">
                          <div className="setting-title">Delete Account</div>
                          <div className="setting-description">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </div>
                        </div>
                        <div className="setting-control">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={handleDeleteAccount}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={handleSaveSettings}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2"></i>
                            Save Settings
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default LabSettings;
