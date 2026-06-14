import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './LabReports.css';

function LabReports() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, getLabReports, getLabBookings, uploadReportFile, saveLabReport, notifyReportShared } = useFirebase();
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [resultSummary, setResultSummary] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchReports();
      fetchBookings();
    }
  }, [currentUser]);

  useEffect(() => {
    if (location.state?.preselectedBookingId && bookings.length > 0) {
      setSelectedBooking(location.state.preselectedBookingId);
      setShowUploadModal(true);
      setUploadStep(1);
    }
  }, [location.state, bookings]);

  useEffect(() => {
    if (selectedBooking) {
      const booking = bookings.find(b => b.id === selectedBooking || b.bookingId === selectedBooking);
      if (booking && booking.testId) {
        setSelectedTest(booking.testId);
      }
    }
  }, [selectedBooking, bookings]);

  const fetchReports = async () => {
    setLoading(true);
    const result = await getLabReports(currentUser.uid);
    if (result.success) {
      setReports(result.data);
    } else {
      showError('Error', result.error || 'Failed to fetch reports');
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    const result = await getLabBookings(currentUser.uid);
    if (result.success) {
      const eligible = result.bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
      setBookings(eligible);
    }
  };

  const currentBookingObj = bookings.find(b => b.id === selectedBooking || b.bookingId === selectedBooking);

  const getSelectedTestObj = () => {
    if (!currentBookingObj || !selectedTest) return null;
    if (currentBookingObj.tests) {
      const testArr = Object.values(currentBookingObj.tests);
      return testArr.find(t => t.testId === selectedTest || t.id === selectedTest) || null;
    }
    return null;
  };

  const getSelectedTestName = () => {
    const testObj = getSelectedTestObj();
    if (testObj) return testObj.testName || testObj.name || 'Unknown Test';
    return currentBookingObj?.testName || 'Unknown Test';
  };

  const getSelectedTestId = () => {
    const testObj = getSelectedTestObj();
    if (testObj) return testObj.testId || testObj.id || '';
    return currentBookingObj?.testId || selectedTest || '';
  };

  const handleNextStep = () => setUploadStep(prev => prev + 1);
  const handlePrevStep = () => setUploadStep(prev => prev - 1);

  const handleConfirmUpload = async () => {
    if (!currentBookingObj || !selectedTest || !uploadFile) return;
    setIsUploading(true);

    try {
      const uploadResult = await uploadReportFile(uploadFile);
      if (!uploadResult.success) throw new Error(uploadResult.error || 'Upload failed');

      const patientInfo = currentBookingObj.patientInfo || {};
      const patientName = patientInfo.fullName || currentBookingObj.patientNameSnapshot || 'N/A';
      const testObj = getSelectedTestObj();
      const actualTestName = getSelectedTestName();
      const actualTestId = getSelectedTestId();

      const reportData = {
        bookingId: currentBookingObj.id || currentBookingObj.bookingId,
        labId: currentUser.uid,
        labName: currentUser.displayName || 'Lab',
        patientProfileId: currentBookingObj.patientProfileId || currentBookingObj.patientInfo?.profileId || currentBookingObj.patientId,
        patientName: patientName,
        testId: actualTestId,
        testName: actualTestName,
        testType: testObj?.testType || currentBookingObj.testType || currentBookingObj.bookingType || 'Lab Test',
        testDate: currentBookingObj.testDate || '',
        testTime: currentBookingObj.testTime || '',
        fileUrl: uploadResult.url,
        resultSummary: resultSummary,
        issuedDate: Date.now()
      };

      const saveResult = await saveLabReport(reportData);
      if (!saveResult.success) throw new Error(saveResult.error || 'Failed to save report');

      await notifyReportShared(currentBookingObj.accountHolderId, currentUser.uid, {
        ...reportData,
        reportId: saveResult.reportId
      });

      showSuccess('Success', 'Report uploaded and shared successfully!');
      setShowUploadModal(false);
      resetModalState();
      fetchReports();
    } catch (error) {
      showError('Upload Error', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetModalState = () => {
    setUploadStep(1);
    setSelectedBooking(location.state?.preselectedBookingId || '');
    setSelectedTest('');
    setUploadFile(null);
    setResultSummary('');
  };

  const handleOpenUploadModal = () => {
    resetModalState();
    setShowUploadModal(true);
  };

  const filteredReports = reports.filter(report => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (report.patientName && report.patientName.toLowerCase().includes(term)) ||
      (report.testName && report.testName.toLowerCase().includes(term)) ||
      (report.id && report.id.toLowerCase().includes(term));
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'shared' ? report.fileUrl : !report.fileUrl);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reports.length,
    shared: reports.filter(r => r.fileUrl).length,
    pending: reports.filter(r => !r.fileUrl).length
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column">
          <LabNavbar toggleSidebar={toggleSidebar} />
          <main className="flex-grow-1 overflow-y-auto">
            <div className="w-100 p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="page-title mb-2">
                  <i className="bi bi-file-earmark-medical me-2 text-primary"></i>Patient Reports
                </h2>
                <p className="page-subtitle text-muted">Manage and share test reports with patients</p>
              </div>
              <button className="btn btn-primary" onClick={handleOpenUploadModal}>
                <i className="bi bi-upload me-2"></i>Upload Report
              </button>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-details">
                    <div className="stat-label">Total Reports</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                  <div className="stat-icon bg-primary"><i className="bi bi-file-earmark-text"></i></div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-details">
                    <div className="stat-label">Shared</div>
                    <div className="stat-value">{stats.shared}</div>
                  </div>
                  <div className="stat-icon bg-success"><i className="bi bi-check-circle"></i></div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stat-card">
                  <div className="stat-details">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value">{stats.pending}</div>
                  </div>
                  <div className="stat-icon bg-warning"><i className="bi bi-clock-history"></i></div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Search Reports</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-search"></i></span>
                      <input type="text" className="form-control" placeholder="Search by Patient Name or Test..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Filter by Status</label>
                    <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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

            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Patient</th>
                      <th>Test</th>
                      <th>Date Uploaded</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <tr key={report.id}>
                          <td><span className="badge bg-secondary">{report.id}</span></td>
                          <td><span className="fw-semibold">{report.patientName}</span></td>
                          <td>{report.testName}</td>
                          <td>{new Date(report.issuedDate).toLocaleDateString()}</td>
                          <td>
                            {report.fileUrl ? (
                              <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Shared</span>
                            ) : (
                              <span className="badge bg-warning"><i className="bi bi-clock me-1"></i>Pending</span>
                            )}
                          </td>
                          <td>
                            {report.fileUrl ? (
                              <div>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => window.open(report.fileUrl, '_blank')} title="View Report">
                                  <i className="bi bi-eye"></i> View
                                </button>
                                <span className="text-success small"><i className="bi bi-check-circle-fill me-1"></i>Shared on {new Date(report.issuedDate).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <button className="btn btn-sm btn-success" onClick={() => { setSelectedBooking(report.bookingId); setShowUploadModal(true); }}><i className="bi bi-upload"></i> Upload</button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4"><i className="bi bi-inbox display-4 text-muted d-block mb-2"></i><p className="text-muted">No reports found.</p></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showUploadModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-upload me-2"></i> Upload Lab Report</h5>
                <button type="button" className="btn-close" onClick={() => setShowUploadModal(false)} disabled={isUploading}></button>
              </div>
              <div className="modal-body">
                {uploadStep === 1 && (
                  <div>
                    <h6>Step 1: Select Booking</h6>
                    <select className="form-select" value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)}>
                      <option value="">-- Select a Booking --</option>
                      {bookings.map(b => {
                        const testCount = b.tests ? Object.keys(b.tests).length : (b.testName ? 1 : 0);
                        return (
                          <option key={b.id || b.bookingId} value={b.id || b.bookingId}>
                            Booking: {b.id || b.bookingId} - {b.patientInfo?.fullName || b.patientNameSnapshot} ({testCount} test{testCount !== 1 ? 's' : ''})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                {uploadStep === 2 && (
                  <div>
                    <h6>Step 2: Select Test</h6>
                    <select className="form-select" value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}>
                      <option value="">-- Select a Test --</option>
                      {currentBookingObj?.tests ? (
                        Object.values(currentBookingObj.tests).map((test, idx) => (
                          <option key={test.testId || test.id || idx} value={test.testId || test.id}>{test.testName || test.name || `Test ${idx + 1}`}</option>
                        ))
                      ) : currentBookingObj?.testId ? (
                        <option value={currentBookingObj.testId}>{currentBookingObj.testName || currentBookingObj.testId}</option>
                      ) : null}
                    </select>
                    {(!currentBookingObj?.tests && !currentBookingObj?.testId) && <p className="text-muted mt-2">No tests available for this booking.</p>}
                  </div>
                )}
                {uploadStep === 3 && (
                  <div>
                    <h6>Step 3: Upload File</h6>
                    <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setUploadFile(e.target.files[0])} />
                  </div>
                )}
                {uploadStep === 4 && (
                  <div>
                    <h6>Step 4: Summary & Confirm</h6>
                    <p className="mb-1"><strong>Patient:</strong> {currentBookingObj?.patientInfo?.fullName || currentBookingObj?.patientNameSnapshot}</p>
                    <p className="mb-1"><strong>Test:</strong> {getSelectedTestName()}</p>
                    <p className="mb-3"><strong>File:</strong> {uploadFile?.name}</p>
                    <label className="form-label">Result Summary (Optional)</label>
                    <textarea className="form-control" rows="3" value={resultSummary} onChange={(e) => setResultSummary(e.target.value)}></textarea>
                    {isUploading && (
                      <div className="alert alert-info mt-3"><i className="bi bi-clock me-2"></i>Uploading report... please wait.</div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {uploadStep > 1 && !isUploading && (
                  <button type="button" className="btn btn-secondary me-auto" onClick={handlePrevStep}>Back</button>
                )}
                {uploadStep < 4 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNextStep} disabled={(uploadStep === 1 && !selectedBooking) || (uploadStep === 2 && !selectedTest) || (uploadStep === 3 && !uploadFile)}>Next</button>
                ) : (
                  <button type="button" className="btn btn-success" onClick={handleConfirmUpload} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Confirm & Upload'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Alert type={alert.type} title={alert.title} message={alert.message} isOpen={alert.isOpen} onClose={closeAlert} />
    </div>
  );
}

export default LabReports;
