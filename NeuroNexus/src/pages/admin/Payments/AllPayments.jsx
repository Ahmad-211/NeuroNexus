import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './AllPayments.css';

function AllPayments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mock payments data
  const [payments] = useState([
    {
      id: 'PAY001',
      type: 'lab',
      userName: 'Rahul Sharma',
      amount: 500,
      date: '2024-01-25',
      paymentMethod: 'Credit Card',
      status: 'paid',
      bookingId: 'BK001',
      description: 'CBC Test'
    },
    {
      id: 'PAY002',
      type: 'doctor',
      userName: 'Priya Patel',
      amount: 1000,
      date: '2024-01-26',
      paymentMethod: 'UPI',
      status: 'pending',
      bookingId: 'BK002',
      description: 'Cardiology Consultation'
    },
    {
      id: 'PAY003',
      type: 'lab',
      userName: 'Amit Kumar',
      amount: 800,
      date: '2024-01-27',
      paymentMethod: 'Net Banking',
      status: 'paid',
      bookingId: 'BK003',
      description: 'Lipid Profile'
    },
    {
      id: 'PAY004',
      type: 'doctor',
      userName: 'Sneha Reddy',
      amount: 1200,
      date: '2024-01-24',
      paymentMethod: 'Wallet',
      status: 'refunded',
      bookingId: 'BK004',
      description: 'Neurology Consultation'
    },
    {
      id: 'PAY005',
      type: 'lab',
      userName: 'Vikram Singh',
      amount: 600,
      date: '2024-01-28',
      paymentMethod: 'Credit Card',
      status: 'failed',
      bookingId: 'BK005',
      description: 'Thyroid Test'
    },
    {
      id: 'PAY006',
      type: 'doctor',
      userName: 'Anjali Gupta',
      amount: 800,
      date: '2024-01-29',
      paymentMethod: 'Debit Card',
      status: 'paid',
      bookingId: 'BK006',
      description: 'Pediatric Visit'
    },
    {
      id: 'PAY007',
      type: 'lab',
      userName: 'Rajesh Iyer',
      amount: 450,
      date: '2024-01-30',
      paymentMethod: 'UPI',
      status: 'paid',
      bookingId: 'BK007',
      description: 'Diabetes Screening'
    },
    {
      id: 'PAY008',
      type: 'doctor',
      userName: 'Meera Krishnan',
      amount: 1500,
      date: '2024-01-31',
      paymentMethod: 'Credit Card',
      status: 'pending',
      bookingId: 'BK008',
      description: 'Orthopedic Consult'
    },
    {
      id: 'PAY009',
      type: 'lab',
      userName: 'Arjun Nair',
      amount: 700,
      date: '2024-02-01',
      paymentMethod: 'Net Banking',
      status: 'paid',
      bookingId: 'BK009',
      description: 'Liver Function'
    },
    {
      id: 'PAY010',
      type: 'doctor',
      userName: 'Kavita Desai',
      amount: 900,
      date: '2024-02-02',
      paymentMethod: 'UPI',
      status: 'paid',
      bookingId: 'BK010',
      description: 'Dermatology Visit'
    }
  ]);

  const handleViewDetails = (paymentId) => {
    navigate(`/payments/${paymentId}`);
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = paymentTypeFilter === 'all' || payment.type === paymentTypeFilter;
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    const paymentDate = new Date(payment.date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    const matchesDate = (!startDate || paymentDate >= startDate) && (!endDate || paymentDate <= endDate);

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Stats
  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-success',
      pending: 'bg-warning text-dark',
      refunded: 'bg-secondary',
      failed: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    return type === 'lab' 
      ? 'bg-primary text-white' 
      : 'bg-success text-white';
  };

  const getPaymentMethodIcon = (method) => {
    if (method.includes('Card')) return 'bi-credit-card';
    if (method === 'UPI') return 'bi-phone';
    if (method === 'Net Banking') return 'bi-bank';
    if (method === 'Wallet') return 'bi-wallet2';
    return 'bi-cash-coin';
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Payment Management" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">All Payments</h2>
                <p className="text-muted mb-0">Track and manage all transactions across the platform</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button className="btn btn-primary">
                  <i className="bi bi-download me-2"></i>
                  Export Report
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Payments</p>
                      <h4 className="mb-0 fw-bold">{totalPayments}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-receipt text-primary" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Paid</p>
                      <h4 className="mb-0 fw-bold text-success">{paidPayments}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-check-circle text-success" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Pending</p>
                      <h4 className="mb-0 fw-bold text-warning">{pendingPayments}</h4>
                    </div>
                    <div className="icon-bg bg-warning bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-hourglass-split text-warning" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h4 className="mb-0 fw-bold text-success">₹{totalRevenue.toLocaleString()}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-currency-rupee text-success" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by user, payment ID, or booking..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Type</label>
                    <select
                      className="form-select"
                      value={paymentTypeFilter}
                      onChange={(e) => setPaymentTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="lab">Lab Payments</option>
                      <option value="doctor">Doctor Payments</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Status</label>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">From</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">To</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-1">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => setDateRange({ start: '', end: '' })}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            {filteredPayments.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-receipt text-muted" style={{fontSize: '48px'}}></i>
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
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">Booking</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map(payment => (
                          <tr key={payment.id}>
                            <td className="px-4 py-3">
                              <code className="text-primary fw-semibold">{payment.id}</code>
                            </td>
                            <td className="px-4 py-3">
                              <div className="fw-semibold">{payment.userName}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${getTypeBadge(payment.type)}`}>
                                {payment.type === 'lab' ? 'Lab' : 'Doctor'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <strong className="text-success">₹{payment.amount.toLocaleString()}</strong>
                            </td>
                            <td className="px-4 py-3">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${getPaymentMethodIcon(payment.paymentMethod)}`}></i>
                                <small>{payment.paymentMethod}</small>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <code className="text-muted">{payment.bookingId}</code>
                              <div><small className="text-muted">{payment.description}</small></div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${getStatusBadge(payment.status)}`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewDetails(payment.id)}
                                  title="View Details"
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  View
                                </button>
                              </div>
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