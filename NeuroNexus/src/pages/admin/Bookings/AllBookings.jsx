import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './AllBookings.css';

function AllBookings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mock bookings data
  const [bookings] = useState([
    {
      id: 'BK001',
      type: 'lab',
      patientName: 'Rahul Sharma',
      patientPhone: '+91 98765 11111',
      assignedTo: 'Pathology Lab - Mumbai',
      testName: 'Complete Blood Count (CBC)',
      bookingDate: '2024-01-25',
      bookingTime: '10:00 AM',
      status: 'completed',
      paymentStatus: 'paid',
      amount: '₹500',
      createdAt: '2024-01-20'
    },
    {
      id: 'BK002',
      type: 'doctor',
      patientName: 'Priya Patel',
      patientPhone: '+91 98765 22222',
      assignedTo: 'Dr. Anita Desai - Cardiologist',
      testName: 'Cardiology Consultation',
      bookingDate: '2024-01-26',
      bookingTime: '02:00 PM',
      status: 'pending',
      paymentStatus: 'pending',
      amount: '₹1000',
      createdAt: '2024-01-21'
    },
    {
      id: 'BK003',
      type: 'lab',
      patientName: 'Amit Kumar',
      patientPhone: '+91 98765 33333',
      assignedTo: 'Diagnostic Center - Delhi',
      testName: 'Lipid Profile Test',
      bookingDate: '2024-01-27',
      bookingTime: '09:30 AM',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: '₹800',
      createdAt: '2024-01-22'
    },
    {
      id: 'BK004',
      type: 'doctor',
      patientName: 'Sneha Reddy',
      patientPhone: '+91 98765 44444',
      assignedTo: 'Dr. Suresh Menon - Neurologist',
      testName: 'Neurology Consultation',
      bookingDate: '2024-01-24',
      bookingTime: '11:00 AM',
      status: 'cancelled',
      paymentStatus: 'refunded',
      amount: '₹1200',
      createdAt: '2024-01-19'
    },
    {
      id: 'BK005',
      type: 'lab',
      patientName: 'Vikram Singh',
      patientPhone: '+91 98765 55555',
      assignedTo: 'Medical Lab - Jaipur',
      testName: 'Thyroid Function Test',
      bookingDate: '2024-01-28',
      bookingTime: '08:00 AM',
      status: 'pending',
      paymentStatus: 'pending',
      amount: '₹600',
      createdAt: '2024-01-23'
    },
    {
      id: 'BK006',
      type: 'doctor',
      patientName: 'Anjali Gupta',
      patientPhone: '+91 98765 66666',
      assignedTo: 'Dr. Kavita Iyer - Pediatrician',
      testName: 'Pediatric Consultation',
      bookingDate: '2024-01-29',
      bookingTime: '03:00 PM',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: '₹800',
      createdAt: '2024-01-24'
    },
    {
      id: 'BK007',
      type: 'lab',
      patientName: 'Rajesh Iyer',
      patientPhone: '+91 98765 77777',
      assignedTo: 'Health Clinic Lab - Chennai',
      testName: 'Diabetes Screening',
      bookingDate: '2024-01-30',
      bookingTime: '07:00 AM',
      status: 'completed',
      paymentStatus: 'paid',
      amount: '₹450',
      createdAt: '2024-01-23'
    },
    {
      id: 'BK008',
      type: 'doctor',
      patientName: 'Meera Krishnan',
      patientPhone: '+91 98765 88888',
      assignedTo: 'Dr. Ramesh Nair - Orthopedic',
      testName: 'Orthopedic Consultation',
      bookingDate: '2024-01-31',
      bookingTime: '04:00 PM',
      status: 'pending',
      paymentStatus: 'pending',
      amount: '₹1500',
      createdAt: '2024-01-25'
    },
    {
      id: 'BK009',
      type: 'lab',
      patientName: 'Arjun Nair',
      patientPhone: '+91 98765 99999',
      assignedTo: 'City Diagnostics - Kochi',
      testName: 'Liver Function Test',
      bookingDate: '2024-02-01',
      bookingTime: '10:30 AM',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: '₹700',
      createdAt: '2024-01-26'
    },
    {
      id: 'BK010',
      type: 'doctor',
      patientName: 'Kavita Desai',
      patientPhone: '+91 98765 10101',
      assignedTo: 'Dr. Meera Krishnan - Dermatologist',
      testName: 'Dermatology Consultation',
      bookingDate: '2024-02-02',
      bookingTime: '01:00 PM',
      status: 'completed',
      paymentStatus: 'paid',
      amount: '₹900',
      createdAt: '2024-01-27'
    }
  ]);

  const handleViewDetails = (bookingId) => {
    navigate(`/bookings/${bookingId}`);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = bookingTypeFilter === 'all' || booking.type === bookingTypeFilter;
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPayment;
  });

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + parseInt(b.amount.replace(/[₹,]/g, '')), 0);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-info',
      completed: 'bg-success',
      cancelled: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getPaymentBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      paid: 'bg-success',
      refunded: 'bg-secondary',
      failed: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    return type === 'lab' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-success text-white';
  };

  const getTypeIcon = (type) => {
    return type === 'lab' ? 'bi-buildings' : 'bi-person-doctor';
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="All Bookings" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">All Bookings</h2>
                <p className="text-muted mb-0">Manage lab and doctor appointments</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  New Booking
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Total Bookings</p>
                      <h4 className="mb-0 fw-bold">{totalBookings}</h4>
                    </div>
                    <div className="icon-bg bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-calendar-check text-primary" style={{fontSize: '24px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card bg-white border-0 rounded-lg p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">Pending</p>
                      <h4 className="mb-0 fw-bold text-warning">{pendingBookings}</h4>
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
                      <p className="text-muted mb-1 small">Completed</p>
                      <h4 className="mb-0 fw-bold text-success">{completedBookings}</h4>
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
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by booking ID, patient, or provider..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={bookingTypeFilter}
                      onChange={(e) => setBookingTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="lab">Lab Bookings</option>
                      <option value="doctor">Doctor Bookings</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                      <option value="all">All Payments</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-outline-secondary w-100">
                      <i className="bi bi-download me-2"></i>Export
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{fontSize: '48px'}}></i>
                  <h5 className="mt-3 text-muted">No bookings found</h5>
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
                          <th className="px-4 py-3">Booking ID</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Patient</th>
                          <th className="px-4 py-3">Assigned To</th>
                          <th className="px-4 py-3">Test/Service</th>
                          <th className="px-4 py-3">Date & Time</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Payment</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map(booking => (
                          <tr key={booking.id}>
                            <td className="px-4 py-3">
                              <code className="text-primary fw-semibold">{booking.id}</code>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${getTypeBadge(booking.type)}`}>
                                <i className={`bi ${getTypeIcon(booking.type)} me-1`}></i>
                                {booking.type === 'lab' ? 'Lab' : 'Doctor'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="fw-semibold">{booking.patientName}</div>
                                <small className="text-muted">{booking.patientPhone}</small>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <small>{booking.assignedTo}</small>
                            </td>
                            <td className="px-4 py-3">
                              <small>{booking.testName}</small>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="fw-semibold">{new Date(booking.bookingDate).toLocaleDateString()}</div>
                                <small className="text-muted">{booking.bookingTime}</small>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <strong className="text-success">{booking.amount}</strong>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${getStatusBadge(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${getPaymentBadge(booking.paymentStatus)}`}>
                                {booking.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleViewDetails(booking.id)}
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

export default AllBookings;
