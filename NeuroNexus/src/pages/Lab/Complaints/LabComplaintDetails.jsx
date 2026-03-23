import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './LabComplaintDetails.css';

function LabComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alert, showWarning, showSuccess, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaintStatus, setComplaintStatus] = useState('pending');
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Sample complaint data - In production, fetch from API using id
  const [complaint] = useState({
    id: 'COMP-001',
    patientName: 'Rajesh Kumar',
    patientEmail: 'rajesh.kumar@email.com',
    patientPhone: '+91 98765 43210',
    complaintTitle: 'Delayed Test Results',
    complaintText: 'Test results were delayed by 3 days. Very disappointed with the service. I had to wait for my CBC test results which were promised within 24 hours. I called multiple times but no one responded properly. This delay caused me a lot of inconvenience as I needed the results urgently for my doctor consultation. The customer service was also unhelpful and gave vague responses.',
    date: '2025-11-29',
    time: '10:30 AM',
    status: 'pending',
    testName: 'Complete Blood Count (CBC)',
    bookingId: 'BK-001',
    attachments: [
      { type: 'image', url: 'https://via.placeholder.com/300x200?text=Evidence+1', name: 'evidence_1.jpg' },
      { type: 'image', url: 'https://via.placeholder.com/300x200?text=Evidence+2', name: 'evidence_2.jpg' }
    ],
    previousResponse: ''
  });

  useEffect(() => {
    setComplaintStatus(complaint.status);
    setAdminResponse(complaint.previousResponse || '');
  }, [complaint]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSaveResponse = () => {
    if (!adminResponse.trim()) {
      showWarning('Required!', 'Please enter a response before saving.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showSuccess('Success!', 'Response saved successfully!');
    }, 1000);
  };

  const handleStatusUpdate = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showSuccess('Success!', `Complaint status updated to ${complaintStatus}.`);
    }, 1000);
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Complaint Details" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <button
                  className="btn btn-link text-decoration-none p-0 mb-2"
                  onClick={() => navigate('/lab/complaints')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Complaints
                </button>
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div>
                    <h2 className="mb-1 fw-bold">Complaint Details</h2>
                    <p className="text-muted mb-0">
                      Complaint ID: <span className="fw-semibold text-primary">{complaint.id}</span>
                    </p>
                  </div>
                  <div className="mt-2 mt-md-0">
                    {complaint.status === 'pending' && (
                      <span className="badge bg-warning text-dark fs-6">
                        <i className="bi bi-hourglass-split me-1"></i>
                        Pending
                      </span>
                    )}
                    {complaint.status === 'resolved' && (
                      <span className="badge bg-success fs-6">
                        <i className="bi bi-check-circle me-1"></i>
                        Resolved
                      </span>
                    )}
                    {complaint.status === 'rejected' && (
                      <span className="badge bg-danger fs-6">
                        <i className="bi bi-x-circle me-1"></i>
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column */}
              <div className="col-lg-8">
                {/* Patient Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      Patient Information
                    </h5>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="text-muted small">Full Name</label>
                          <p className="fw-semibold mb-0">{complaint.patientName}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="text-muted small">Phone Number</label>
                          <p className="fw-semibold mb-0">
                            <i className="bi bi-telephone me-2"></i>
                            {complaint.patientPhone}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="text-muted small">Email Address</label>
                          <p className="fw-semibold mb-0">
                            <i className="bi bi-envelope me-2"></i>
                            {complaint.patientEmail}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="text-muted small">Related Test</label>
                          <p className="fw-semibold mb-0">{complaint.testName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-exclamation-triangle me-2 text-danger"></i>
                      Complaint Details
                    </h5>
                    <div className="row g-4">
                      <div className="col-12">
                        <div className="info-item">
                          <label className="text-muted small">Subject</label>
                          <p className="fw-semibold mb-0 fs-5">{complaint.complaintTitle}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="text-muted small">Date</label>
                          <p className="fw-semibold mb-0">
                            <i className="bi bi-calendar3 me-2"></i>
                            {new Date(complaint.date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="text-muted small">Time</label>
                          <p className="fw-semibold mb-0">
                            <i className="bi bi-clock me-2"></i>
                            {complaint.time}
                          </p>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="info-item">
                          <label className="text-muted small">Full Description</label>
                          <div className="complaint-text-box">
                            {complaint.complaintText}
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="info-item">
                          <label className="text-muted small">Booking Reference</label>
                          <p className="mb-0">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/lab/bookings/${complaint.bookingId}`)}
                            >
                              <i className="bi bi-link-45deg me-1"></i>
                              View Booking {complaint.bookingId}
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <h5 className="card-title mb-4 fw-bold">
                        <i className="bi bi-paperclip me-2 text-primary"></i>
                        Attachments ({complaint.attachments.length})
                      </h5>
                      <div className="row g-3">
                        {complaint.attachments.map((attachment, index) => (
                          <div key={index} className="col-md-4">
                            <div className="attachment-card">
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="attachment-image"
                              />
                              <div className="attachment-info">
                                <small className="text-truncate d-block">{attachment.name}</small>
                                <button className="btn btn-sm btn-link p-0">
                                  <i className="bi bi-download me-1"></i>
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                {/* Status Update */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-gear me-2 text-primary"></i>
                      Update Status
                    </h5>
                    <div className="mb-3">
                      <label className="form-label">Complaint Status</label>
                      <select
                        className="form-select"
                        value={complaintStatus}
                        onChange={(e) => setComplaintStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleStatusUpdate}
                      disabled={loading || complaintStatus === complaint.status}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Status
                        </>
                      )}
                    </button>
                    {complaintStatus !== complaint.status && (
                      <small className="text-muted d-block mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Click to save changes
                      </small>
                    )}
                  </div>
                </div>

                {/* Admin Response */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="card-title mb-4 fw-bold">
                      <i className="bi bi-chat-left-text me-2 text-primary"></i>
                      Admin Response
                    </h5>
                    <div className="mb-3">
                      <label className="form-label">Your Response</label>
                      <textarea
                        className="form-control"
                        rows="6"
                        placeholder="Enter your response to the patient..."
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                      ></textarea>
                      <small className="text-muted">
                        Provide a detailed response explaining how the complaint was handled
                      </small>
                    </div>
                    <button
                      className="btn btn-success w-100"
                      onClick={handleSaveResponse}
                      disabled={loading || !adminResponse.trim()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Response
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

export default LabComplaintDetails;
