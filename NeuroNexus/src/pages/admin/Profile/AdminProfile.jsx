import { useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './AdminProfile.css';

function AdminProfile() {
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@neuronexus.com',
    phone: '+91 98765 43210',
    role: 'Administrator',
    joinedDate: 'January 2024',
    department: 'Administration',
    location: 'Mumbai, Maharashtra',
    bio: 'System Administrator managing the NeuroNexus Healthcare Platform'
  });

  // Profile Picture State
  const [profilePicture, setProfilePicture] = useState(null);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
      // TODO: Upload to Firebase Storage
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      // TODO: Update profile in Firebase
      showSuccess('Success!', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Error!', 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarning('Mismatch!', 'New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showWarning('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      // TODO: Update password in Firebase Auth
      showSuccess('Success!', 'Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Error!', 'Failed to change password.');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Admin Profile" />
        <main className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4 profile-page">
            {/* Header */}
            <div className="page-header mb-4">
              <div>
                <h2 className="page-title mb-2">
                  <i className="bi bi-person-circle text-primary me-2"></i>
                  My Profile
                </h2>
                <p className="page-subtitle text-muted mb-0">
                  Manage your personal information and account settings
                </p>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column - Profile Picture & Quick Stats */}
              <div className="col-lg-4">
                {/* Profile Picture Card */}
                <div className="card shadow-sm mb-4">
                  <div className="card-body text-center">
                    <div className="profile-picture-wrapper mb-3">
                      <div className="profile-picture">
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile" />
                        ) : (
                          <div className="profile-picture-placeholder">
                            <i className="bi bi-person"></i>
                          </div>
                        )}
                      </div>
                      <label htmlFor="profilePictureInput" className="change-picture-btn">
                        <i className="bi bi-camera"></i>
                      </label>
                      <input
                        type="file"
                        id="profilePictureInput"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <h4 className="mb-1">{profileData.name}</h4>
                    <p className="text-muted mb-3">{profileData.role}</p>
                    <div className="profile-badges">
                      <span className="badge bg-primary">
                        <i className="bi bi-shield-check me-1"></i> Verified Admin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Info Card */}
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h6 className="mb-0"><i className="bi bi-info-circle me-2"></i>Account Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <div className="info-label">
                        <i className="bi bi-calendar-check text-primary me-2"></i>
                        Joined
                      </div>
                      <div className="info-value">{profileData.joinedDate}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <i className="bi bi-building text-success me-2"></i>
                        Department
                      </div>
                      <div className="info-value">{profileData.department}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">
                        <i className="bi bi-geo-alt text-danger me-2"></i>
                        Location
                      </div>
                      <div className="info-value">{profileData.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Form & Password */}
              <div className="col-lg-8">
                {/* Profile Information Card */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><i className="bi bi-person-lines-fill me-2"></i>Profile Details</h5>
                    {!isEditing ? (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>
                        <i className="bi bi-pencil me-1"></i> Edit Profile
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditing(false)}>
                        <i className="bi bi-x me-1"></i> Cancel
                      </button>
                    )}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                            disabled={!isEditing}
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
                          <label className="form-label">Bio</label>
                          <textarea
                            className="form-control"
                            name="bio"
                            rows="3"
                            value={profileData.bio}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                          ></textarea>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="mt-4">
                          <button type="submit" className="btn btn-primary">
                            <i className="bi bi-check-circle me-2"></i> Save Changes
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Change Password Card */}
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0"><i className="bi bi-lock-fill me-2"></i>Change Password</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleChangePassword}>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Current Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              className="form-control"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => togglePasswordVisibility('current')}
                            >
                              <i className={`bi ${showPasswords.current ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">New Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              className="form-control"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => togglePasswordVisibility('new')}
                            >
                              <i className={`bi ${showPasswords.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                          </div>
                          <small className="text-muted">Must be at least 6 characters</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Confirm New Password</label>
                          <div className="password-input-wrapper">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              className="form-control"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => togglePasswordVisibility('confirm')}
                            >
                              <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button type="submit" className="btn btn-primary">
                          <i className="bi bi-shield-check me-2"></i> Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
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

export default AdminProfile;
