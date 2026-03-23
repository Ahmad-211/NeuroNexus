import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './SubmitComplaint.css';

function SubmitComplaint() {
  const navigate = useNavigate();
  const { currentUser, submitComplaint } = useFirebase();
  const { alert, showWarning, showSuccess, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    subject: '',
    category: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Lab name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      showWarning('Login Required', 'Please login to submit a complaint.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const complaintData = {
        ...formData,
        labId: currentUser.uid,
        status: 'pending'
      };

      const result = await submitComplaint(complaintData);

      if (result.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/lab/dashboard');
        }, 3000);
      } else {
        setErrors({ submit: result.error || 'Failed to submit complaint' });
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setErrors({ submit: error.message || 'Failed to submit complaint. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Submit Complaint" />
        
        <div className="flex-grow-1 overflow-y-auto bg-light">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <h2 className="complaint-title mb-1">
                      <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                      Submit Complaint
                    </h2>
                    <p className="text-muted mb-0">Report issues or concerns to the administrator</p>
                  </div>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/lab/dashboard')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <div className="row mb-4">
                <div className="col-12">
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    <strong>Error!</strong> {errors.submit}
                    <button type="button" className="btn-close" onClick={() => setErrors({})}></button>
                  </div>
                </div>
              </div>
            )}

            {/* Form and Info Cards */}
            <div className="row g-4">
              {/* Main Form */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 fw-semibold">
                      <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                      Complaint Details
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                      {/* Lab Name & Subject */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label htmlFor="username" className="form-label fw-semibold">
                            Lab Name <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-building"></i>
                            </span>
                            <input
                              type="text"
                              className={`form-control border-start-0 ${errors.username ? 'is-invalid' : ''}`}
                              id="username"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              placeholder="Enter your lab name"
                            />
                            {errors.username && (
                              <div className="invalid-feedback">{errors.username}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="category" className="form-label fw-semibold">
                            Category <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-tag"></i>
                            </span>
                            <select
                              className={`form-select border-start-0 ${errors.category ? 'is-invalid' : ''}`}
                              id="category"
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                            >
                              <option value="">Select category</option>
                              <option value="Technical Issue">🔧 Technical Issue</option>
                              <option value="Payment Issue">💳 Payment Issue</option>
                              <option value="Service Quality">⭐ Service Quality</option>
                              <option value="System Bug">🐛 System Bug</option>
                              <option value="Account Issue">👤 Account Issue</option>
                              <option value="Booking Issue">📅 Booking Issue</option>
                              <option value="Report Issue">📄 Report Issue</option>
                              <option value="Other">📌 Other</option>
                            </select>
                            {errors.category && (
                              <div className="invalid-feedback">{errors.category}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="mb-3">
                        <label htmlFor="subject" className="form-label fw-semibold">
                          Subject <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="bi bi-pencil-square"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control border-start-0 ${errors.subject ? 'is-invalid' : ''}`}
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Brief summary of your complaint"
                            maxLength="100"
                          />
                          {errors.subject && (
                            <div className="invalid-feedback">{errors.subject}</div>
                          )}
                        </div>
                        <small className="text-muted">{formData.subject.length}/100 characters</small>
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label fw-semibold">
                          Complaint Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Please provide detailed information about your complaint..."
                          rows="6"
                          maxLength="1000"
                        ></textarea>
                        <div className="d-flex justify-content-between mt-1">
                          {errors.description ? (
                            <div className="text-danger small">{errors.description}</div>
                          ) : (
                            <small className="text-muted">Minimum 20 characters required</small>
                          )}
                          <small className="text-muted">{formData.description.length}/1000</small>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-3">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Submit Complaint
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg px-4"
                          onClick={() => navigate('/lab/dashboard')}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Info Sidebar */}
              <div className="col-lg-4">
                {/* Guidelines Card */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-info-circle text-primary me-2"></i>
                      Submission Guidelines
                    </h6>
                    <ul className="list-unstyled mb-0 small">
                      <li className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Be specific and detailed in your description
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Include relevant dates and times
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Choose the appropriate category
                      </li>
                      <li className="mb-0">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Include all relevant information
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Support Info Card */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-headset text-success me-2"></i>
                      Need Immediate Help?
                    </h6>
                    <p className="small text-muted mb-3">For urgent issues, contact us directly:</p>
                    <div className="d-flex flex-column gap-2 small">
                      <a href="mailto:support@neuronexus.com" className="text-decoration-none">
                        <i className="bi bi-envelope me-2"></i>
                        support@neuronexus.com
                      </a>
                      <a href="tel:+911234567890" className="text-decoration-none">
                        <i className="bi bi-telephone me-2"></i>
                        +91 123 456 7890
                      </a>
                      <div>
                        <i className="bi bi-clock me-2"></i>
                        Mon-Fri: 9 AM - 6 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h4 className="mt-3 mb-2">Complaint Submitted!</h4>
            <p className="text-muted mb-0">Your complaint has been received. Admin will review it shortly.</p>
          </div>
        </div>
      )}

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

export default SubmitComplaint;
