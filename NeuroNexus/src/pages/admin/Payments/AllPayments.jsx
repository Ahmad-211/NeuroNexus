import { useState, useEffect } from 'react';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './AllPayments.css';

function AllPayments() {
  const { getAllPayments } = useFirebase();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const result = await getAllPayments();
      if (result.success) {
        setPayments(result.payments);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const formatCurrency = (amount, currency) => {
    const symbol = currency === 'PKR' ? 'Rs' : '$';
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredPayments = payments.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      p.paymentId.toLowerCase().includes(q) ||
      p.patientName.toLowerCase().includes(q) ||
      p.bookingId.toLowerCase().includes(q) ||
      (p.assignedTo && p.assignedTo.toLowerCase().includes(q));
    const matchesType = paymentTypeFilter === 'all' || p.type === paymentTypeFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'partial').length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const getStatusBadge = (status) => {
    const map = { paid: 'bg-success', pending: 'bg-warning text-dark', partial: 'bg-info text-dark', refunded: 'bg-secondary', failed: 'bg-danger', cancelled: 'bg-secondary' };
    return map[status] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    return type === 'lab' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-success text-white';
  };

  const getMethodIcon = (method) => {
    const m = (method || '').toLowerCase();
    if (m.includes('card') || m === 'credit card') return 'bi-credit-card';
    if (m === 'upi') return 'bi-phone';
    if (m.includes('net')) return 'bi-bank';
    if (m === 'wallet') return 'bi-wallet2';
    if (m === 'pay_at_clinic' || m === 'cash') return 'bi-cash';
    if (m === 'online') return 'bi-globe2';
    return 'bi-cash-coin';
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Payment Management" />
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">All Payments</h2>
                <p className="text-muted mb-0">Track and manage all transactions across the platform</p>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Payments</p>
                      <h4 className="mb-0 fw-bold">{totalPayments}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-receipt text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Paid</p>
                      <h4 className="mb-0 fw-bold text-success">{paidPayments}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-check-circle text-success" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Pending / Partial</p>
                      <h4 className="mb-0 fw-bold text-warning">{pendingPayments}</h4>
                    </div>
                    <div className="icon-bg bg-warning bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h4 className="mb-0 fw-bold text-success">Rs{totalRevenue.toLocaleString()}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-currency-rupee text-success" style={{ fontSize: '24px' }}></i>
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
                      <input type="text" className="form-control border-start-0" placeholder="Search by payment ID, patient, or booking..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small">Type</label>
                    <select className="form-select" value={paymentTypeFilter} onChange={e => setPaymentTypeFilter(e.target.value)}>
                      <option value="all">All Types</option>
                      <option value="lab">Lab Payments</option>
                      <option value="doctor">Doctor Payments</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small">Status</label>
                    <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mb-0">Loading payments...</p>
                </div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-receipt text-muted" style={{ fontSize: '48px' }}></i>
                  <h5 className="mt-3 text-muted">No payments found</h5>
                  <p className="text-muted">Try adjusting your search or filters.</p>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3">Payment ID</th>
                          <th className="px-4 py-3">Patient</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Installment</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((p, i) => (
                          <tr key={p.bookingId + p.paymentId + i}>
                            <td className="px-4 py-3">
                              <code className="text-primary fw-semibold">{p.paymentId}</code>
                              <div><small className="text-muted">{p.bookingId}</small></div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="fw-semibold">{p.patientName}</div>
                              <small className="text-muted">{p.assignedTo}</small>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${getTypeBadge(p.type)}`}>
                                {p.type === 'lab' ? 'Lab' : 'Doctor'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <strong>{formatCurrency(p.amount, p.currency)}</strong>
                            </td>
                            <td className="px-4 py-3">
                              {p.isInstallment ? (
                                <span className="text-success fw-semibold">{formatCurrency(p.paidAmount, p.currency)}</span>
                              ) : (
                                <span className={p.status === 'paid' ? 'text-success' : 'text-muted'}>
                                  {p.status === 'paid' ? formatCurrency(p.amount, p.currency) : '-'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${getMethodIcon(p.paymentMethod)}`}></i>
                                <small>{p.paymentMethod === 'PAY_AT_CLINIC' ? 'Pay at Clinic' : p.paymentMethod === 'ONLINE' ? 'Online' : p.paymentMethod}</small>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(p.date)}
                            </td>
                            <td className="px-4 py-3">
                              {p.isInstallment ? (
                                <div>
                                  <span className="badge bg-info text-dark me-1">
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
                            <td className="px-4 py-3">
                              <span className={`badge ${getStatusBadge(p.status)}`}>
                                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllPayments;
