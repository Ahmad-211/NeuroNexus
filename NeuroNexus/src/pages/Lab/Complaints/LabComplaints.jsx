import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import './LabComplaints.css';

function LabComplaints() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample complaints data
  const allComplaints = [
    {
      id: 'COMP-001',
      patientName: 'Rajesh Kumar',
      complaintText: 'Test results were delayed by 3 days. Very disappointed with the service. I had to wait...',
      fullComplaint: 'Test results were delayed by 3 days. Very disappointed with the service. I had to wait for my CBC test results which were promised within 24 hours.',
      date: '2025-11-29',
      time: '10:30 AM',
      status: 'pending'
    },
    {
      id: 'COMP-002',
      patientName: 'Priya Sharma',
      complaintText: 'Staff behavior was unprofessional during blood sample collection...',
      fullComplaint: 'Staff behavior was unprofessional during blood sample collection. The technician was rude and did not follow proper hygiene protocols.',
      date: '2025-11-28',
      time: '02:15 PM',
      status: 'resolved'
    },
    {
      id: 'COMP-003',
      patientName: 'Amit Singh',
      complaintText: 'Wrong test was conducted. I booked for Thyroid but got Lipid Profile done...',
      fullComplaint: 'Wrong test was conducted. I booked for Thyroid Profile but got Lipid Profile done instead. This is completely unacceptable.',
      date: '2025-11-27',
      time: '11:00 AM',
      status: 'rejected'
    },
    {
      id: 'COMP-004',
      patientName: 'Neha Patel',
      complaintText: 'Lab was not clean and equipment looked old and rusty...',
      fullComplaint: 'Lab was not clean and equipment looked old and rusty. Very concerned about hygiene standards.',
      date: '2025-11-26',
      time: '09:45 AM',
      status: 'pending'
    },
    {
      id: 'COMP-005',
      patientName: 'Vikas Mehta',
      complaintText: 'Report was not available for download even after 48 hours...',
      fullComplaint: 'Report was not available for download even after 48 hours. Customer service did not respond to my calls.',
      date: '2025-11-25',
      time: '04:30 PM',
      status: 'resolved'
    },
    {
      id: 'COMP-006',
      patientName: 'Kavita Desai',
      complaintText: 'Overcharged for MRI scan. Was quoted ₹4000 but charged ₹5000...',
      fullComplaint: 'Overcharged for MRI scan. Was quoted ₹4000 but charged ₹5000 without any prior notice or explanation.',
      date: '2025-11-24',
      time: '01:20 PM',
      status: 'pending'
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Filter complaints
  const filteredComplaints = allComplaints.filter(complaint => {
    const matchesSearch =
      complaint.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.complaintText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count complaints by status
  const pendingCount = allComplaints.filter(c => c.status === 'pending').length;
  const resolvedCount = allComplaints.filter(c => c.status === 'resolved').length;
  const rejectedCount = allComplaints.filter(c => c.status === 'rejected').length;

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Complaints" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="mb-1 fw-bold">Complaint Management</h2>
                <p className="text-muted mb-0">Track and resolve patient complaints</p>
              </div>
            </div>

            {/* Status Filter Badges */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className={`filter-badge ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    All Complaints
                    <span className="badge-count">{allComplaints.length}</span>
                  </button>
                  <button
                    className={`filter-badge pending ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                  >
                    <i className="bi bi-hourglass-split me-2"></i>
                    Pending
                    <span className="badge-count">{pendingCount}</span>
                  </button>
                  <button
                    className={`filter-badge resolved ${statusFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('resolved')}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Resolved
                    <span className="badge-count">{resolvedCount}</span>
                  </button>
                  <button
                    className={`filter-badge rejected ${statusFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('rejected')}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Rejected
                    <span className="badge-count">{rejectedCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search by patient name, complaint ID, or text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">Complaint ID</th>
                            <th className="py-3">Patient Name</th>
                            <th className="py-3">Complaint Text</th>
                            <th className="py-3">Date & Time</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComplaints.length > 0 ? (
                            filteredComplaints.map((complaint) => (
                              <tr key={complaint.id}>
                                <td className="px-4 py-3">
                                  <span className="fw-semibold text-primary">{complaint.id}</span>
                                </td>
                                <td className="py-3">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-circle bg-danger text-white me-2">
                                      {complaint.patientName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="fw-semibold">{complaint.patientName}</span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="complaint-preview">
                                    {complaint.complaintText}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div>
                                    <div className="text-dark">
                                      <i className="bi bi-calendar3 me-1"></i>
                                      {new Date(complaint.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <small className="text-muted">
                                      <i className="bi bi-clock me-1"></i>
                                      {complaint.time}
                                    </small>
                                  </div>
                                </td>
                                <td className="py-3">
                                  {complaint.status === 'pending' && (
                                    <span className="badge bg-warning text-dark">
                                      <i className="bi bi-hourglass-split me-1"></i>
                                      Pending
                                    </span>
                                  )}
                                  {complaint.status === 'resolved' && (
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Resolved
                                    </span>
                                  )}
                                  {complaint.status === 'rejected' && (
                                    <span className="badge bg-danger">
                                      <i className="bi bi-x-circle me-1"></i>
                                      Rejected
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 text-center">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/lab/complaints/${complaint.id}`)}
                                  >
                                    <i className="bi bi-eye me-1"></i>
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center py-5">
                                <div className="text-muted">
                                  <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                  <p className="mb-0">No complaints found</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabComplaints;
