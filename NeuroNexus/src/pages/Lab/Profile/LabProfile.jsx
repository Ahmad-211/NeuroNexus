import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './LabProfile.css';

function LabProfile() {
  const { currentUser, getLabById, updateLabProfile, uploadLabLogo, changePassword } = useFirebase();
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    labName: '',
    email: '',
    phone: '',
    labTiming: '',
    labDescription: '',
    logo: null
  });

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

  // Fetch lab data on component mount
  useEffect(() => {
    const fetchLabData = async () => {
      if (currentUser) {
        const result = await getLabById(currentUser.uid);
        if (result.success) {
          const labData = result.lab;
          setProfileData({
            labName: labData.name || labData.labName || '',
            email: labData.email || '',
            phone: labData.phone || '',
            labTiming: labData.labTiming || '',
            labDescription: labData.labDescription || '',
            logo: labData.profilePicUrl || null
          });
          setLogoPreview(labData.profilePicUrl || 'https://via.placeholder.com/150?text=Lab+Logo');
        }
      }
      setLoading(false);
    };

    fetchLabData();
  }, [currentUser, getLabById]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setLogoFile(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let logoUrl = profileData.logo;
      
      // Upload logo if a new file is selected
      if (logoFile) {
        const uploadResult = await uploadLabLogo(currentUser.uid, logoFile);
        if (uploadResult.success) {
          logoUrl = uploadResult.url;
        } else {
          showError('Upload Failed', 'Failed to upload logo: ' + uploadResult.error);
          setLoading(false);
          return;
        }
      }
      
      // Update profile data (only phone, labTiming, labDescription, and logo)
      const updateData = {
        phone: profileData.phone,
        labTiming: profileData.labTiming,
        labDescription: profileData.labDescription,
        profilePicUrl: logoUrl
      };
      
      const result = await updateLabProfile(currentUser.uid, updateData);
      
      if (result.success) {
        showSuccess('Success!', 'Profile updated successfully!');
        setIsEditing(false);
        setLogoFile(null);
        // Refresh the profile data
        const labResult = await getLabById(currentUser.uid);
        if (labResult.success) {
          const labData = labResult.lab;
          setProfileData({
            labName: labData.name || labData.labName || '',
            email: labData.email || '',
            phone: labData.phone || '',
            labTiming: labData.labTiming || '',
            labDescription: labData.labDescription || '',
            logo: labData.profilePicUrl || null
          });
          setLogoPreview(labData.profilePicUrl || 'https://via.placeholder.com/150?text=Lab+Logo');
        }
      } else {
        showError('Error!', 'Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Error!', 'Failed to update profile.');
    } finally {
      setLoading(false);
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

    setPasswordLoading(true);
    
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        showSuccess('Success!', 'Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showError('Error!', result.error || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Error!', 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Lab Profile" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="page-header mb-4">
              <div>
                <h2 className="page-title mb-2">
                  <i className="bi bi-building text-primary me-2"></i>
                  Lab Profile
                </h2>
                <p className="page-subtitle text-muted mb-0">
                  Manage your laboratory information and account settings
                </p>
              </div>
            </div>

            {loading && !profileData.labName ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading profile...</p>
              </div>
            ) : (
            <div className="row g-4">
              {/* Left Column - Lab Logo */}
              <div className="col-lg-4">
                {/* Lab Logo Card */}
                <div className="card shadow-sm mb-4">
                  <div className="card-body text-center">
                    <div className="profile-picture-wrapper mb-3">
                      <div className="profile-picture">
                        <img src={logoPreview} alt="Lab Logo" />
                      </div>
                      <label htmlFor="logoInput" className="change-picture-btn">
                        <i className="bi bi-camera"></i>
                      </label>
                      <input
                        type="file"
                        id="logoInput"
                        accept="image/*"
                        onChange={handleLogoChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <h4 className="mb-1">{profileData.labName}</h4>
                    <p className="text-muted mb-3">{profileData.email}</p>
                    <div className="profile-badges">
                      <span className="badge bg-success">
                        <i className="bi bi-shield-check me-1"></i> Verified Lab
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Hours Card */}
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h6 className="mb-0"><i className="bi bi-clock me-2"></i>Operating Hours</h6>
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <div className="info-label">
                        <i className="bi bi-calendar-week text-primary me-2"></i>
                        Timing
                      </div>
                      <div className="info-value">{profileData.labTiming}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Form & Password */}
              <div className="col-lg-8">
                {/* Lab Information Card */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><i className="bi bi-building me-2"></i>Lab Details</h5>
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
                        <div className="col-md-12">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Operating Hours</label>
                          <input
                            type="text"
                            className="form-control"
                            name="labTiming"
                            value={profileData.labTiming}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            placeholder="e.g., 9:00 AM - 8:00 PM"
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">About / Lab Description</label>
                          <textarea
                            className="form-control"
                            name="labDescription"
                            rows="4"
                            value={profileData.labDescription}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            placeholder="Enter lab description..."
                          ></textarea>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="mt-4">
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i> Save Changes
                              </>
                            )}
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
                        <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                          {passwordLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Changing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-shield-check me-2"></i> Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            )}
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

export default LabProfile;
