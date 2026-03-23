import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './ComplaintsList.css';

function ComplaintsList() {
  const navigate = useNavigate();
  const { getAllComplaints } = useFirebase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [viewMode, setViewMode] = useState('card'); // table or card
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const result = await getAllComplaints();
      
      if (result.success) {
        setComplaints(result.complaints);
      } else {
        console.error('Error fetching complaints:', result.error);
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleViewDetails = (complaintId) => {
    navigate(`/complaints/${complaintId}`);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          complaint.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          complaint.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all' && complaint.createdAt) {
      const complaintDate = new Date(complaint.createdAt);
      const today = new Date();
      const diffTime = today - complaintDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today') matchesDate = diffDays === 0;
      else if (dateFilter === 'week') matchesDate = diffDays <= 7;
      else if (dateFilter === 'month') matchesDate = diffDays <= 30;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length
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
    if (!priority || priority === 'NA') return 'badge-na';
    switch(priority.toLowerCase()) {
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-na';
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
          <div className="w-100 p-4 complaints-list-page">
            {/* Header */}
            <div className="page-header mb-4">
              <div>
                <h2 className="page-title mb-2">
                  <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                  Complaints Management
                </h2>
                <p className="page-subtitle text-muted mb-0">
                  View and manage all user complaints
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-xl-3 col-md-6">
                <div className="stat-card stat-card-total">
                  <div className="stat-icon">
                    <i className="bi bi-clipboard-data"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Complaints</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="stat-card stat-card-pending">
                  <div className="stat-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value">{stats.pending}</div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="stat-card stat-card-resolved">
                  <div className="stat-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Resolved</div>
                    <div className="stat-value">{stats.resolved}</div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="stat-card stat-card-rejected">
                  <div className="stat-icon">
                    <i className="bi bi-x-circle"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value">{stats.rejected}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  {/* Search */}
                  <div className="col-lg-4">
                    <div className="search-box">
                      <i className="bi bi-search"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by user, subject, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="col-lg-2 col-md-4">
                    <select 
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div className="col-lg-2 col-md-4">
                    <select 
                      className="form-select"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="col-lg-4 col-md-4 d-flex justify-content-end gap-2">
                    <button 
                      className={`btn view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      <i className="bi bi-table"></i> Table
                    </button>
                    <button 
                      className={`btn view-mode-btn ${viewMode === 'card' ? 'active' : ''}`}
                      onClick={() => setViewMode('card')}
                    >
                      <i className="bi bi-grid-3x2"></i> Card
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="results-info mb-3">
              <span className="text-muted">
                Showing {filteredComplaints.length} of {complaints.length} complaints
              </span>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="card shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover complaints-table mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User Name</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Submitted Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td>
                            <span className="complaint-id">{complaint.id}</span>
                          </td>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                {complaint.username?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="user-name">{complaint.username || 'Unknown'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="complaint-subject">{complaint.subject}</div>
                            <div className="complaint-preview">{complaint.description?.substring(0, 60) || ''}...</div>
                          </td>
                          <td>
                            <span className="badge badge-category">{complaint.category}</span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(complaint.priority)}`}>
                              {complaint.priority === 'NA' ? 'NA' : complaint.priority?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                              {complaint.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-muted">{formatDate(complaint.createdAt)}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleViewDetails(complaint.id)}
                            >
                              <i className="bi bi-eye me-1"></i> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Card View */}
            {viewMode === 'card' && (
              <div className="row g-3">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="col-xl-4 col-lg-6">
                    <div className="complaint-card">
                      <div className="complaint-card-header">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="complaint-id">{complaint.id}</span>
                          <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
                            {complaint.status?.toUpperCase()}
                          </span>
                        </div>
                        <h6 className="complaint-subject mb-2">{complaint.subject}</h6>
                        <div className="d-flex gap-2 mb-3">
                          <span className="badge badge-category">{complaint.category}</span>
                          <span className={`badge ${getPriorityBadgeClass(complaint.priority)}`}>
                            {complaint.priority === 'NA' ? 'NA' : complaint.priority?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="complaint-card-body">
                        <div className="user-info mb-3">
                          <div className="user-avatar">
                            {complaint.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="user-name">{complaint.username || 'Unknown'}</div>
                          </div>
                        </div>
                        <p className="complaint-preview">{complaint.description?.substring(0, 100) || 'No description'}...</p>
                        <div className="complaint-date text-muted mb-3">
                          <i className="bi bi-calendar3 me-2"></i>
                          {formatDate(complaint.createdAt)}
                        </div>
                        <button 
                          className="btn btn-primary w-100"
                          onClick={() => handleViewDetails(complaint.id)}
                        >
                          <i className="bi bi-eye me-2"></i> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredComplaints.length === 0 && (
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No complaints found</h5>
                  <p className="text-muted mb-0">Try adjusting your search or filter criteria</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ComplaintsList;
