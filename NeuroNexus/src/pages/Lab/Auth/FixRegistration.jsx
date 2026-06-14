import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import { uploadImageToCloudinary } from '../../../utils/uploadCloudinary';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './FixRegistration.css';

function LabFixRegistration() {
  const navigate = useNavigate();
  const { currentUser, labStatus, getLabRejectionReason, resubmitLabRegistration, logout } = useFirebase();
  const { alert, showSuccess, showError, closeAlert } = useAlert();

  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Faisalabad',
    labTiming: '',
    licenseNumber: '',
    offersInstallments: false,
    maxInstallments: ''
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [licenseFileName, setLicenseFileName] = useState('');
  const [logoFileName, setLogoFileName] = useState('');

  useEffect(() => {
    const fetchLabData = async () => {
      if (!currentUser) return;
      const result = await getLabRejectionReason(currentUser.uid);
      if (result.success) {
        setLabData(result.lab);
        setEditData({
          name: result.lab.name || '',
          phone: result.lab.phone || '',
          address: result.lab.address || '',
          city: result.lab.city || 'Faisalabad',
          labTiming: result.lab.labTiming || '',
          licenseNumber: result.lab.licenseNumber || '',
          offersInstallments: result.lab.offersInstallments || false,
          maxInstallments: result.lab.maxInstallments || ''
        });
      }
      setLoading(false);
    };
    fetchLabData();
  }, [currentUser, getLabRejectionReason]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLicenseFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseFile(file);
      setLicenseFileName(file.name);
    }
  };

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoFileName(file.name);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/lab/login', { replace: true });
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) {
      showError('Validation Error', 'Lab name is required.');
      return;
    }

    setSubmitting(true);

    try {
      let licenseImageUrl = labData?.licenseImageUrl || '';
      let profilePicUrl = labData?.profilePicUrl || '';

      if (licenseFile) {
        licenseImageUrl = await uploadImageToCloudinary(licenseFile);
      }
      if (logoFile) {
        profilePicUrl = await uploadImageToCloudinary(logoFile);
      }

      const updateData = {
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        city: editData.city,
        labTiming: editData.labTiming,
        licenseNumber: editData.licenseNumber,
        offersInstallments: editData.offersInstallments,
        maxInstallments: editData.maxInstallments || 0,
        licenseImageUrl,
        profilePicUrl
      };

      const result = await resubmitLabRegistration(currentUser.uid, updateData);
      if (result.success) {
        showSuccess('Resubmitted!', result.message);
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        showError('Error', result.error || 'Failed to resubmit application.');
      }
    } catch (error) {
      showError('Error', error.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fix-reg-loading">
        <div className="spinner"></div>
        <p>Loading your application...</p>
      </div>
    );
  }

  if (labStatus !== 'rejected') {
    return (
      <div className="fix-reg-not-rejected">
        <div className="fix-reg-not-rejected-content">
          <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: '#28a745' }}></i>
          <h2>Your account is not rejected</h2>
          <p>You do not need to fix your registration.</p>
          <button className="login-btn" onClick={() => navigate('/lab/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fix-reg-container">
      <div className="fix-reg-wrapper">
        <div className="fix-reg-form-panel">
          <div className="logo-section">
            <div className="logo-icon">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" />
            </div>
            <h1 className="logo-text">NeuroNexus</h1>
          </div>

          <div className="fix-reg-header">
            <h2 className="fix-reg-title">Fix Registration</h2>
            <p className="fix-reg-subtitle">Your application was rejected. Please fix the issues below and resubmit.</p>
          </div>

          {labData?.rejectionReason && (
            <div className="rejection-banner">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>
                <strong>Rejection Reason:</strong>
                <p>{labData.rejectionReason}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleResubmit} className="fix-reg-form">
            <div className="form-group">
              <label className="form-label">Lab Name *</label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter lab name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                name="phone"
                value={editData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                value={editData.address}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <select
                name="city"
                value={editData.city}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Faisalabad">Faisalabad</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Multan">Multan</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Quetta">Quetta</option>
                <option value="Sialkot">Sialkot</option>
                <option value="Gujranwala">Gujranwala</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lab Timing</label>
              <input
                type="text"
                name="labTiming"
                value={editData.labTiming}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 9:00 AM - 9:00 PM"
              />
            </div>

            <div className="form-group">
              <label className="form-label">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={editData.licenseNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter license number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload License Document</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="licenseFile"
                  onChange={handleLicenseFile}
                  accept="image/*,.pdf"
                  className="file-input"
                />
                <label htmlFor="licenseFile" className="file-input-label">
                  <i className="bi bi-cloud-upload"></i>
                  {licenseFileName || 'Choose file (leave blank to keep existing)'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Logo</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="logoFile"
                  onChange={handleLogoFile}
                  accept="image/*"
                  className="file-input"
                />
                <label htmlFor="logoFile" className="file-input-label">
                  <i className="bi bi-cloud-upload"></i>
                  {logoFileName || 'Choose file (leave blank to keep existing)'}
                </label>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="offersInstallments"
                  checked={editData.offersInstallments}
                  onChange={handleChange}
                />
                <span>Offers Installments</span>
              </label>
            </div>

            {editData.offersInstallments && (
              <div className="form-group">
                <label className="form-label">Max Installments</label>
                <input
                  type="number"
                  name="maxInstallments"
                  value={editData.maxInstallments}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Maximum number of installments"
                  min="1"
                />
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="login-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Resubmitting...
                  </>
                ) : (
                  'Resubmit Application'
                )}
              </button>
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </form>
        </div>

        <div className="fix-reg-hero-panel">
          <div className="hero-decoration">
            <div className="hero-circle hero-circle-1"></div>
            <div className="hero-circle hero-circle-2"></div>
          </div>
          <div className="hero-content">
            <h2 className="hero-title">Fix &amp; Resubmit</h2>
            <p className="hero-subtitle">
              Update your information and re-upload any required documents. After resubmission, our team will review your application again.
            </p>
            <div className="hero-illustration">
              <div className="illustration-workspace">
                <div className="desk"></div>
                <div className="monitor">
                  <div className="monitor-screen">
                    <div className="screen-content">
                      <div className="screen-icon">📝</div>
                      <div className="screen-lines">
                        <div className="line"></div>
                        <div className="line"></div>
                      </div>
                    </div>
                  </div>
                  <div className="monitor-stand"></div>
                  <div className="monitor-base"></div>
                </div>
                <div className="person">
                  <div className="person-head"></div>
                  <div className="person-body"></div>
                  <div className="person-arm-left"></div>
                  <div className="person-arm-right"></div>
                </div>
                <div className="chair">
                  <div className="chair-back"></div>
                  <div className="chair-seat"></div>
                </div>
                <div className="plant">
                  <div className="pot"></div>
                  <div className="leaf leaf-1"></div>
                  <div className="leaf leaf-2"></div>
                  <div className="leaf leaf-3"></div>
                </div>
                <div className="documents">
                  <div className="doc-page"></div>
                  <div className="doc-icon">📋</div>
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

export default LabFixRegistration;
