import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './LabReports.css';

function LabReports() {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // TODO: Replace with actual Firebase query
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockReports = [
        {
          id: 'RPT001',
          patientId: 'PAT12345',
          patientName: 'John Doe',
          patientEmail: 'john.doe@example.com',
          testName: 'Complete Blood Count (CBC)',
          testDate: '2024-12-05',
          reportDate: '2024-12-06',
          status: 'shared',
          sharedOn: '2024-12-06',
          reportUrl: '/reports/RPT001.pdf'
        },
        {
          id: 'RPT002',
          patientId: 'PAT67890',
          patientName: 'Jane Smith',
          patientEmail: 'jane.smith@example.com',
          testName: 'Lipid Profile',
          testDate: '2024-12-04',
          reportDate: '2024-12-05',
          status: 'pending',
          sharedOn: null,
          reportUrl: '/reports/RPT002.pdf'
        },
        {
          id: 'RPT003',
          patientId: 'PAT11223',
          patientName: 'Robert Johnson',
          patientEmail: 'robert.j@example.com',
          testName: 'Thyroid Profile',
          testDate: '2024-12-03',
          reportDate: '2024-12-04',
          status: 'shared',
          sharedOn: '2024-12-04',
          reportUrl: '/reports/RPT003.pdf'
        },
        {
          id: 'RPT004',
          patientId: 'PAT44556',
          patientName: 'Emily Davis',
          patientEmail: 'emily.davis@example.com',
          testName: 'Liver Function Test',
          testDate: '2024-12-02',
          reportDate: '2024-12-03',
          status: 'pending',
          sharedOn: null,
          reportUrl: '/reports/RPT004.pdf'
        },
        {
          id: 'RPT005',
          patientId: 'PAT78901',
          patientName: 'Michael Brown',
          patientEmail: 'michael.b@example.com',
          testName: 'X-Ray Chest',
          testDate: '2024-12-01',
          reportDate: '2024-12-02',
          status: 'shared',
          sharedOn: '2024-12-02',
          reportUrl: '/reports/RPT005.pdf'
        }
      ];
      
      setReports(mockReports);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleShareReport = (report) => {
    setSelectedReport(report);
    setShowShareModal(true);
  };

  const confirmShare = async () => {
    try {
      // TODO: Implement Firebase logic to share report
      /*
      import { getDatabase, ref, update } from 'firebase/database';
      const db = getDatabase();
      
      await update(ref(db, `reports/${selectedReport.id}`), {
        status: 'shared',
        sharedOn: new Date().toISOString()
      });
      
      // Send notification/email to patient
      */

      setReports(reports.map(report => 
        report.id === selectedReport.id 
          ? { ...report, status: 'shared', sharedOn: new Date().toISOString().split('T')[0] }
          : report
      ));
      
      setShowShareModal(false);
      setSelectedReport(null);
      showSuccess('Success!', 'Report shared successfully with patient!');
    } catch (error) {
      console.error('Error sharing report:', error);
      showError('Error!', 'Failed to share report. Please try again.');
    }
  };

  const handleViewReport = (reportUrl) => {
    // Open report in new tab
    window.open(reportUrl, '_blank');
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.testName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reports.length,
    shared: reports.filter(r => r.status === 'shared').length,
    pending: reports.filter(r => r.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column">
          <LabNavbar toggleSidebar={toggleSidebar} />
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
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <div className="flex-grow-1 d-flex flex-column">
        <LabNavbar toggleSidebar={toggleSidebar} />
        <main className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4 lab-reports-page">
            {/* Header */}
            <div className="page-header mb-4">
              <h2 className="page-title mb-2">
                <i className="bi bi-file-earmark-medical me-2 text-primary"></i>
                Patient Reports
              </h2>
              <p className="page-subtitle text-muted">Manage and share test reports with patients</p>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-icon bg-primary">
                    <i className="bi bi-file-earmark-text"></i>
                  </div>
                  <div className="stat-details">
                    <div className="stat-label">Total Reports</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-icon bg-success">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="stat-details">
                    <div className="stat-label">Shared</div>
                    <div className="stat-value">{stats.shared}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-icon bg-warning">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div className="stat-details">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value">{stats.pending}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Search Reports</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Patient ID, Name, or Test..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Filter by Status</label>
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Reports</option>
                      <option value="shared">Shared</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Reports List ({filteredReports.length})
                </h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Patient ID</th>
                      <th>Patient Details</th>
                      <th>Test Name</th>
                      <th>Test Date</th>
                      <th>Report Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <tr key={report.id}>
                          <td>
                            <span className="badge bg-secondary">{report.id}</span>
                          </td>
                          <td>
                            <span className="badge bg-info">{report.patientId}</span>
                          </td>
                          <td>
                            <div className="cell-with-subtitle">
                              <span className="cell-main fw-semibold">{report.patientName}</span>
                              <span className="cell-sub text-muted">{report.patientEmail}</span>
                            </div>
                          </td>
                          <td>{report.testName}</td>
                          <td>{new Date(report.testDate).toLocaleDateString()}</td>
                          <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                          <td>
                            {report.status === 'shared' ? (
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Shared
                              </span>
                            ) : (
                              <span className="badge bg-warning">
                                <i className="bi bi-clock me-1"></i>
                                Pending
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleViewReport(report.reportUrl)}
                                title="View Report"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              {report.status === 'pending' && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleShareReport(report)}
                                  title="Share with Patient"
                                >
                                  <i className="bi bi-share"></i> Share
                                </button>
                              )}
                              {report.status === 'shared' && (
                                <span className="text-success small">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Shared on {new Date(report.sharedOn).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <i className="bi bi-inbox display-4 text-muted d-block mb-2"></i>
                          <p className="text-muted">No reports found matching your criteria</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Share Report Modal */}
      {showShareModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-share me-2"></i>
                  Share Report with Patient
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowShareModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedReport && (
                  <div>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      This report will be shared with the patient and they will receive a notification.
                    </div>
                    
                    <div className="report-details">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Report ID:</label>
                        <p className="mb-0">{selectedReport.id}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Patient ID:</label>
                        <p className="mb-0">{selectedReport.patientId}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Patient Name:</label>
                        <p className="mb-0">{selectedReport.patientName}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Patient Email:</label>
                        <p className="mb-0">{selectedReport.patientEmail}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Test Name:</label>
                        <p className="mb-0">{selectedReport.testName}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowShareModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={confirmShare}
                >
                  <i className="bi bi-share me-2"></i>
                  Confirm & Share
                </button>
              </div>
            </div>
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

export default LabReports;
