import { useState } from 'react';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import './LabPayments.css';

function LabPayments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Sample payments data
  const allPayments = [
    { id: 'TXN-001', patientName: 'Rajesh Kumar', testName: 'Complete Blood Count', amount: 500, method: 'UPI', date: '2025-11-30', status: 'paid' },
    { id: 'TXN-002', patientName: 'Anjali Sharma', testName: 'X-Ray Chest', amount: 800, method: 'Card', date: '2025-11-30', status: 'paid' },
    { id: 'TXN-003', patientName: 'Priya Gupta', testName: 'MRI Brain Scan', amount: 5000, method: 'Net Banking', date: '2025-11-29', status: 'paid' },
    { id: 'TXN-004', patientName: 'Vikas Kumar', testName: 'ECG Test', amount: 350, method: 'Cash', date: '2025-11-29', status: 'pending' },
    { id: 'TXN-005', patientName: 'Sanjay Mehta', testName: 'Ultrasound Abdomen', amount: 1200, method: 'UPI', date: '2025-11-28', status: 'paid' },
    { id: 'TXN-006', patientName: 'Neha Patel', testName: 'CT Scan Chest', amount: 3500, method: 'Card', date: '2025-11-28', status: 'refunded' },
    { id: 'TXN-007', patientName: 'Amit Singh', testName: 'Lipid Profile', amount: 600, method: 'UPI', date: '2025-11-27', status: 'paid' },
    { id: 'TXN-008', patientName: 'Kavita Desai', testName: 'Thyroid Profile', amount: 450, method: 'Net Banking', date: '2025-11-27', status: 'pending' },
    { id: 'TXN-009', patientName: 'Rohit Verma', testName: 'Liver Function Test', amount: 750, method: 'UPI', date: '2025-11-26', status: 'paid' },
    { id: 'TXN-010', patientName: 'Pooja Jain', testName: 'Kidney Function Test', amount: 800, method: 'Card', date: '2025-11-26', status: 'paid' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Calculate summary statistics
  const totalEarnings = allPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayments = allPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const completedPayments = allPayments.filter(p => p.status === 'paid').length;
  
  const refunds = allPayments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  // Filter payments
  const filteredPayments = allPayments
    .filter(payment => {
      const matchesSearch = 
        payment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMethod = paymentMethodFilter === 'all' || payment.method === paymentMethodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Payments" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="mb-1 fw-bold">Payment Management</h2>
                <p className="text-muted mb-0">Track all transactions and earnings</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm stat-card">
                  <div className="card-body">
                    <div className="stat-icon bg-success">
                      <i className="bi bi-cash-stack"></i>
                    </div>
                    <p className="text-muted mb-2 small">Total Earnings</p>
                    <h3 className="fw-bold mb-0">₹{totalEarnings.toLocaleString()}</h3>
                    <small className="text-success">
                      <i className="bi bi-arrow-up me-1"></i>
                      {completedPayments} completed
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm stat-card">
                  <div className="card-body">
                    <div className="stat-icon bg-warning">
                      <i className="bi bi-hourglass-split"></i>
                    </div>
                    <p className="text-muted mb-2 small">Pending Payments</p>
                    <h3 className="fw-bold mb-0">₹{pendingPayments.toLocaleString()}</h3>
                    <small className="text-warning">
                      <i className="bi bi-clock me-1"></i>
                      {allPayments.filter(p => p.status === 'pending').length} awaiting
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm stat-card">
                  <div className="card-body">
                    <div className="stat-icon bg-primary">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <p className="text-muted mb-2 small">Completed Payments</p>
                    <h3 className="fw-bold mb-0">{completedPayments}</h3>
                    <small className="text-primary">
                      <i className="bi bi-graph-up me-1"></i>
                      This month
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm stat-card">
                  <div className="card-body">
                    <div className="stat-icon bg-danger">
                      <i className="bi bi-arrow-counterclockwise"></i>
                    </div>
                    <p className="text-muted mb-2 small">Refunds</p>
                    <h3 className="fw-bold mb-0">₹{refunds.toLocaleString()}</h3>
                    <small className="text-danger">
                      <i className="bi bi-dash-circle me-1"></i>
                      {allPayments.filter(p => p.status === 'refunded').length} refunded
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="row g-3 align-items-center">
                      {/* Search */}
                      <div className="col-lg-4 col-md-12">
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search by patient, test, or transaction ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div className="col-lg-3 col-md-6">
                        <select
                          className="form-select"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      {/* Payment Method Filter */}
                      <div className="col-lg-3 col-md-6">
                        <select
                          className="form-select"
                          value={paymentMethodFilter}
                          onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        >
                          <option value="all">All Methods</option>
                          <option value="UPI">UPI</option>
                          <option value="Card">Card</option>
                          <option value="Net Banking">Net Banking</option>
                          <option value="Cash">Cash</option>
                        </select>
                      </div>

                      {/* Export Button */}
                      <div className="col-lg-2 col-md-12">
                        <button className="btn btn-primary w-100">
                          <i className="bi bi-download me-2"></i>
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">Transaction ID</th>
                            <th className="py-3">Patient Name</th>
                            <th className="py-3">Test Name</th>
                            <th className="py-3">Amount (₹)</th>
                            <th className="py-3">Payment Method</th>
                            <th className="py-3">Date</th>
                            <th className="py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                              <tr key={payment.id}>
                                <td className="px-4 py-3">
                                  <span className="fw-semibold text-primary">{payment.id}</span>
                                </td>
                                <td className="py-3">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-circle bg-primary text-white me-2">
                                      {payment.patientName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="fw-semibold">{payment.patientName}</span>
                                  </div>
                                </td>
                                <td className="py-3">{payment.testName}</td>
                                <td className="py-3">
                                  <span className="fw-bold">₹{payment.amount}</span>
                                </td>
                                <td className="py-3">
                                  <span className="payment-method-badge">
                                    {payment.method === 'UPI' && <i className="bi bi-phone me-1"></i>}
                                    {payment.method === 'Card' && <i className="bi bi-credit-card me-1"></i>}
                                    {payment.method === 'Net Banking' && <i className="bi bi-bank me-1"></i>}
                                    {payment.method === 'Cash' && <i className="bi bi-cash me-1"></i>}
                                    {payment.method}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <div>
                                    <div className="text-dark">
                                      {new Date(payment.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  {payment.status === 'paid' && (
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Paid
                                    </span>
                                  )}
                                  {payment.status === 'pending' && (
                                    <span className="badge bg-warning text-dark">
                                      <i className="bi bi-hourglass-split me-1"></i>
                                      Pending
                                    </span>
                                  )}
                                  {payment.status === 'refunded' && (
                                    <span className="badge bg-danger">
                                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                                      Refunded
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center py-5">
                                <div className="text-muted">
                                  <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                  <p className="mb-0">No payments found</p>
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

export default LabPayments;
