import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import './LabPayments.css';

function LabPayments() {
  const { getAllPayments, currentUser } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!currentUser) return;
      setLoading(true);
      const result = await getAllPayments(currentUser.uid);
      if (result.success) {
        setPayments(result.payments);
      }
      setLoading(false);
    };
    fetchPayments();
  }, [currentUser]);

  const formatCurrency = (amount, currency) => {
    const symbol = currency === 'PKR' ? 'Rs' : '$';
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalEarnings = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.paidAmount, 0);
  const pendingTotal = payments.filter(p => p.status === 'pending' || p.status === 'partial').reduce((s, p) => s + (p.isInstallment ? p.pendingAmount : p.amount), 0);
  const completedPayments = payments.filter(p => p.status === 'paid').length;
  const refunds = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      p.patientName.toLowerCase().includes(q) ||
      p.testName.toLowerCase().includes(q) ||
      p.paymentId.toLowerCase().includes(q) ||
      p.bookingId.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const map = { paid: 'bg-success', pending: 'bg-warning text-dark', partial: 'bg-info text-dark', refunded: 'bg-danger', failed: 'bg-danger' };
    return map[status] || 'bg-secondary';
  };

  const getMethodIcon = (method) => {
    const m = (method || '').toLowerCase();
    if (m.includes('card')) return 'bi-credit-card';
    if (m === 'upi') return 'bi-phone';
    if (m.includes('net')) return 'bi-bank';
    if (m === 'pay_at_clinic' || m === 'cash') return 'bi-cash';
    if (m === 'online') return 'bi-globe2';
    return 'bi-cash-coin';
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Payments" />
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="mb-1 fw-bold">Payment Management</h2>
                <p className="text-muted mb-0">Track all transactions and earnings</p>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Earnings</p>
                      <h4 className="mb-0 fw-bold text-success">{formatCurrency(totalEarnings, 'PKR')}</h4>
                      <small className="text-success">{completedPayments} completed</small>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-cash-stack text-success" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Pending / Partial</p>
                      <h4 className="mb-0 fw-bold text-warning">{formatCurrency(pendingTotal, 'PKR')}</h4>
                      <small className="text-warning">{payments.filter(p => p.status === 'pending' || p.status === 'partial').length} awaiting</small>
                    </div>
                    <div className="icon-bg bg-warning bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-hourglass-split text-warning" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Completed Payments</p>
                      <h4 className="mb-0 fw-bold">{completedPayments}</h4>
                      <small className="text-primary">Total transactions</small>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-check-circle text-primary" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Refunds</p>
                      <h4 className="mb-0 fw-bold text-danger">{formatCurrency(refunds, 'PKR')}</h4>
                      <small className="text-danger">{payments.filter(p => p.status === 'refunded').length} refunded</small>
                    </div>
                    <div className="icon-bg bg-danger bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-arrow-counterclockwise text-danger" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input type="text" className="form-control border-start-0" placeholder="Search by payment ID, patient, or booking..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small">Status</label>
                    <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

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
                            <th className="py-3">Test</th>
                            <th className="py-3">Amount</th>
                            <th className="py-3">Paid</th>
                            <th className="py-3">Method</th>
                            <th className="py-3">Date</th>
                            <th className="py-3">Installment</th>
                            <th className="py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan="9" className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </td>
                            </tr>
                          ) : filteredPayments.length > 0 ? (
                            filteredPayments.map((p, i) => (
                              <tr key={p.bookingId + p.paymentId + i}>
                                <td className="px-4 py-3">
                                  <span className="fw-semibold text-primary">{p.paymentId}</span>
                                </td>
                                <td className="py-3">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-circle bg-primary text-white me-2">
                                      {p.patientName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="fw-semibold">{p.patientName}</span>
                                  </div>
                                </td>
                                <td className="py-3">{p.testName}</td>
                                <td className="py-3">
                                  <span className="fw-bold">{formatCurrency(p.amount, p.currency)}</span>
                                </td>
                                <td className="py-3">
                                  {p.isInstallment ? (
                                    <span className="text-success fw-semibold">{formatCurrency(p.paidAmount, p.currency)}</span>
                                  ) : (
                                    <span className={p.status === 'paid' ? 'text-success' : 'text-muted'}>
                                      {p.status === 'paid' ? formatCurrency(p.amount, p.currency) : '-'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3">
                                  <span className="payment-method-badge">
                                    <i className={`bi ${getMethodIcon(p.paymentMethod)} me-1`}></i>
                                    {p.paymentMethod === 'PAY_AT_CLINIC' ? 'Pay at Clinic' : p.paymentMethod === 'ONLINE' ? 'Online' : p.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-3">
                                  {formatDate(p.date)}
                                </td>
                                <td className="py-3">
                                  {p.isInstallment ? (
                                    <div>
                                      <span className="badge bg-info text-dark">
                                        {p.installmentPlan.paidInstallments}/{p.installmentPlan.numInstallments}
                                      </span>
                                      <small className="text-muted d-block">
                                        {formatCurrency(p.installmentPlan.installmentAmount, p.currency)} each
                                      </small>
                                    </div>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  <span className={`badge ${getStatusBadge(p.status)}`}>
                                    <i className={`bi ${p.status === 'paid' ? 'bi-check-circle' : p.status === 'partial' ? 'bi-hourglass-split' : p.status === 'pending' ? 'bi-clock' : 'bi-arrow-counterclockwise'} me-1`}></i>
                                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9" className="text-center py-5">
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
