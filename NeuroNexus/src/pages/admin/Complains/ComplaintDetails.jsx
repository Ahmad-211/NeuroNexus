import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './ComplaintDetails.css';

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, updateComplaint } = useFirebase();
  const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaintData();
  }, [id]);

  const fetchComplaintData = async () => {
    try {
      setLoading(true);
      const result = await getComplaintById(id);
      
      if (result.success) {
        setComplaint(result.complaint);
        setSelectedStatus(result.complaint.status);
        setSelectedPriority(result.complaint.priority || 'NA');
        setAdminResponse(result.complaint.adminResponse || '');
      } else {
        console.error('Error fetching complaint:', result.error);
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBack = () => {
    navigate('/complaints');
  };

  const handleSubmitResponse = async () => {
    if (!adminResponse.trim()) {
      showWarning('Required!', 'Please enter a response before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateData = {
        adminResponse: adminResponse,
        responseDate: Date.now(),
        status: 'resolved',
        resolvedAt: Date.now()
      };

      const result = await updateComplaint(id, updateData);

      if (result.success) {
        setComplaint(prev => ({
          ...prev,
          ...updateData
        }));
        setSelectedStatus('resolved');
        showSuccess('Success!', 'Response submitted successfully! Lab has been notified.');
      } else {
        showError('Error!', 'Failed to submit response: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      showError('Error!', 'Failed to submit response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSelectedStatus(newStatus);
    
    try {
      const result = await updateComplaint(id, { status: newStatus });
      
      if (result.success) {
        setComplaint(prev => ({ ...prev, status: newStatus }));
      } else {
        showError('Error!', 'Failed to update status: ' + result.error);
        setSelectedStatus(complaint.status);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Error!', 'Failed to update status.');
      setSelectedStatus(complaint.status);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setSelectedPriority(newPriority);
    
    try {
      const result = await updateComplaint(id, { priority: newPriority });
      
      if (result.success) {
        setComplaint(prev => ({ ...prev, priority: newPriority }));
      } else {
        showError('Error!', 'Failed to update priority: ' + result.error);
        setSelectedPriority(complaint.priority);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      showError('Error!', 'Failed to update priority.');
      setSelectedPriority(complaint.priority);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'badge-pending';
      case 'resolved': return 'badge-resolved';
      case 'rejected': return 'badge-rejected';
      default: return 'badge-pending';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    if (!priority || priority === 'NA') return 'badge-secondary';
    switch(priority.toLowerCase()) {
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-secondary';
    }
  };

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

  if (!complaint) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="flex-grow-1 d-flex flex-column">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-grow-1 overflow-y-auto">
            <div className="w-100 p-4">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Complaint not found
              </div>
              <button className="btn btn-primary" onClick={handleBack}>
                <i className="bi bi-arrow-left me-2"></i> Back to Complaints
              </button>
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
          <div className="w-100 p-4 complaint-details-page">
            {/* Header */}
            <div className="page-header mb-4">
              <button className="btn btn-outline-secondary mb-3" onClick={handleBack}>
                <i className="bi bi-arrow-left me-2"></i> Back to Complaints
              </button>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="page-title mb-2">
                    <i className="bi bi-file-text-fill text-primary me-2"></i>
                    Complaint Details
                  </h2>
                  <p className="page-subtitle text-muted mb-0">
                    ID: <span className="complaint-id">{complaint.id}</span>
                  </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <span className={`badge ${getPriorityBadgeClass(complaint.priority)} fs-6`}>
                    {complaint.priority === 'NA' ? 'NA' : complaint.priority?.toUpperCase()} PRIORITY
                  </span>
                  <span className={`badge ${getStatusBadgeClass(complaint.status)} fs-6`}>
                    {complaint.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column - Complaint Details */}
              <div className="col-lg-8">
                {/* Complaint Details */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                      Complaint Details
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="info-group">
                          <label className="info-label">
                            <i className="bi bi-person me-2"></i>Lab Name
                          </label>
                          <div className="info-value">{complaint.username || 'Unknown'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-group">
                          <label className="info-label">
                            <i className="bi bi-calendar3 me-2"></i>Submitted Date
                          </label>
                          <div className="info-value">{formatDate(complaint.createdAt)}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="info-group">
                          <label className="info-label">Category</label>
                          <span className="badge badge-category">{complaint.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="complaint-subject-box">
                      <h6 className="mb-2">Subject</h6>
                      <p className="complaint-subject">{complaint.subject}</p>
                    </div>

                    <div className="complaint-description-box">
                      <h6 className="mb-2">Complaint Description</h6>
                      <p className="complaint-description">{complaint.description}</p>
                    </div>
                  </div>
                </div>

                {/* Previous Admin Response (if exists) */}
                {complaint.adminResponse && (
                  <div className="card shadow-sm mb-4 border-success">
                    <div className="card-header bg-success bg-opacity-10">
                      <h5 className="mb-0 text-success">
                        <i className="bi bi-reply-fill me-2"></i>
                        Admin Response
                      </h5>
                      {complaint.responseDate && (
                        <small className="text-muted">
                          Responded on {formatDate(complaint.responseDate)}
                        </small>
                      )}
                    </div>
                    <div className="card-body">
                      <p className="mb-0">{complaint.adminResponse}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Admin Actions */}
              <div className="col-lg-4">
                {/* Status Update */}
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-gear-fill text-primary me-2"></i>
                      Update Status
                    </h5>
                  </div>
                  <div className="card-body">
                    <label className="form-label fw-semibold">Complaint Status</label>
                    <select 
                      className="form-select mb-3"
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <label className="form-label fw-semibold">Complaint Priority</label>
                    <select 
                      className="form-select mb-3"
                      value={selectedPriority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                    >
                      <option value="NA">Not Assigned</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>

                    <div className="status-info-box">
                      <p className="mb-2 fw-semibold">Guidelines:</p>
                      <ul className="status-guidelines">
                        <li><strong>Status & Priority:</strong> Auto-saved on change</li>
                        <li><strong>Response:</strong> Submit when ready</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Admin Response */}
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-chat-left-text-fill text-primary me-2"></i>
                      Admin Response
                    </h5>
                  </div>
                  <div className="card-body">
                    <label className="form-label fw-semibold">Your Response</label>
                    <textarea
                      className="form-control mb-3"
                      rows="8"
                      placeholder="Enter your response to the user..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                    ></textarea>

                    <button 
                      className="btn btn-primary w-100"
                      onClick={handleSubmitResponse}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill me-2"></i>
                          Submit Response
                        </>
                      )}
                    </button>

                    <div className="response-templates mt-3">
                      <p className="mb-2 fw-semibold text-muted">Quick Templates:</p>
                      <button 
                        className="btn btn-sm btn-outline-secondary w-100 mb-2"
                        onClick={() => setAdminResponse('We sincerely apologize for the inconvenience. Your issue has been forwarded to the concerned department and will be resolved within 24-48 hours.')}
                      >
                        Apology & Timeline
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-secondary w-100 mb-2"
                        onClick={() => setAdminResponse('Thank you for bringing this to our attention. We have investigated your complaint and taken corrective action. You will receive a refund within 5-7 business days.')}
                      >
                        Refund Response
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-secondary w-100"
                        onClick={() => setAdminResponse('We have reviewed your complaint but found it to be duplicate/invalid. For further assistance, please contact our support team at support@neuronexus.com.')}
                      >
                        Rejection Notice
                      </button>
                    </div>
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

export default ComplaintDetails;
