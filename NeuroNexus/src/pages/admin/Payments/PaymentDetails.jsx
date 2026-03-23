import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './PaymentDetails.css';

function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alert, showSuccess, showInfo, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Mock payment data
  const payment = {
    id: id,
    transactionId: 'TXN' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    type: 'lab',
    status: 'paid',
    amount: 500,
    platformFee: 50,
    totalAmount: 550,
    date: '2024-01-25',
    time: '10:30 AM',
    paymentMethod: 'Credit Card',
    cardLastFour: '4532',
    cardType: 'Visa',
    user: {
      id: 'USR001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      avatar: null
    },
    booking: {
      id: 'BK001',
      date: '2024-01-26',
      time: '09:00 AM',
      type: 'lab',
      serviceName: 'Complete Blood Count (CBC)',
      provider: 'City Care Diagnostics',
      providerId: 'LAB001',
      address: '123 Main Street, Mumbai, Maharashtra 400001'
    },
    paymentGateway: {
      name: 'Razorpay',
      orderId: 'order_' + Math.random().toString(36).substring(2, 15),
      paymentId: 'pay_' + Math.random().toString(36).substring(2, 15)
    },
    refundInfo: null,
    timeline: [
      { status: 'Payment Initiated', time: '2024-01-25 10:30:00', icon: 'bi-arrow-right-circle', color: 'primary' },
      { status: 'Payment Authenticated', time: '2024-01-25 10:30:15', icon: 'bi-shield-check', color: 'info' },
      { status: 'Payment Processing', time: '2024-01-25 10:30:30', icon: 'bi-hourglass-split', color: 'warning' },
      { status: 'Payment Successful', time: '2024-01-25 10:30:45', icon: 'bi-check-circle-fill', color: 'success' }
    ]
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: 'bg-success', text: 'Paid', icon: 'bi-check-circle-fill' },
      pending: { bg: 'bg-warning text-dark', text: 'Pending', icon: 'bi-hourglass-split' },
      refunded: { bg: 'bg-secondary', text: 'Refunded', icon: 'bi-arrow-counterclockwise' },
      failed: { bg: 'bg-danger', text: 'Failed', icon: 'bi-x-circle-fill' }
    };
    return badges[status] || badges.pending;
  };

  const statusInfo = getStatusBadge(payment.status);

  const handleRefund = () => {
    if (window.confirm('Are you sure you want to initiate a refund for this payment?')) {
      // TODO: Implement refund logic
      showSuccess('Success!', 'Refund initiated successfully!');
    }
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    showInfo('Coming Soon', 'Receipt download will be implemented with backend.');
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4 payment-details-page">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <button 
                  className="btn btn-link text-decoration-none p-0 mb-2"
                  onClick={() => navigate('/payments')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Payments
                </button>
                <h2 className="mb-1 fw-bold">Payment Details</h2>
                <p className="text-muted mb-0">Complete information about payment transaction</p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary" onClick={handleDownloadReceipt}>
                  <i className="bi bi-download me-2"></i>
                  Download Receipt
                </button>
                {payment.status === 'paid' && (
                  <button className="btn btn-outline-danger" onClick={handleRefund}>
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Initiate Refund
                  </button>
                )}
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column */}
              <div className="col-lg-8">
                {/* Payment Status Card */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h5 className="mb-2">Payment Information</h5>
                        <p className="text-muted mb-0">Transaction ID: <code className="text-primary">{payment.transactionId}</code></p>
                      </div>
                      <span className={`badge ${statusInfo.bg} px-3 py-2`}>
                        <i className={`bi ${statusInfo.icon} me-1`}></i>
                        {statusInfo.text}
                      </span>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Payment Date & Time</label>
                          <div className="info-value">
                            <i className="bi bi-calendar-event text-primary me-2"></i>
                            {new Date(payment.date).toLocaleDateString()} at {payment.time}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Payment Method</label>
                          <div className="info-value">
                            <i className="bi bi-credit-card text-primary me-2"></i>
                            {payment.cardType} •••• {payment.cardLastFour}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Payment Gateway</label>
                          <div className="info-value">
                            <i className="bi bi-shield-check text-success me-2"></i>
                            {payment.paymentGateway.name}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Payment Type</label>
                          <div className="info-value">
                            <span className={`badge ${payment.type === 'lab' ? 'bg-primary' : 'bg-success'}`}>
                              {payment.type === 'lab' ? 'Lab Booking' : 'Doctor Consultation'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Information Card */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="mb-3">
                      <i className="bi bi-person-circle text-primary me-2"></i>
                      User Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Name</label>
                          <div className="info-value">{payment.user.name}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">User ID</label>
                          <div className="info-value">
                            <code className="text-primary">{payment.user.id}</code>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Email</label>
                          <div className="info-value">
                            <i className="bi bi-envelope me-2"></i>
                            {payment.user.email}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Phone</label>
                          <div className="info-value">
                            <i className="bi bi-phone me-2"></i>
                            {payment.user.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Information Card */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="mb-3">
                      <i className="bi bi-calendar-check text-success me-2"></i>
                      Booking Information
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Booking ID</label>
                          <div className="info-value">
                            <code className="text-primary">{payment.booking.id}</code>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Appointment Date</label>
                          <div className="info-value">
                            {new Date(payment.booking.date).toLocaleDateString()} at {payment.booking.time}
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="info-box">
                          <label className="info-label">Service</label>
                          <div className="info-value fw-semibold">{payment.booking.serviceName}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="info-box">
                          <label className="info-label">Provider</label>
                          <div className="info-value">
                            <i className="bi bi-building me-2"></i>
                            {payment.booking.provider}
                          </div>
                          <small className="text-muted d-block mt-1">
                            <i className="bi bi-geo-alt me-1"></i>
                            {payment.booking.address}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Details */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-3">
                      <i className="bi bi-gear text-secondary me-2"></i>
                      Gateway Details
                    </h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Order ID</label>
                          <div className="info-value">
                            <code className="text-muted small">{payment.paymentGateway.orderId}</code>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box">
                          <label className="info-label">Payment ID</label>
                          <div className="info-value">
                            <code className="text-muted small">{payment.paymentGateway.paymentId}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                {/* Amount Breakdown Card */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="mb-3">
                      <i className="bi bi-currency-rupee text-success me-2"></i>
                      Amount Breakdown
                    </h5>
                    <div className="amount-breakdown">
                      <div className="amount-item">
                        <span>Service Amount</span>
                        <span className="fw-semibold">₹{payment.amount.toLocaleString()}</span>
                      </div>
                      <div className="amount-item">
                        <span>Platform Fee</span>
                        <span className="fw-semibold">₹{payment.platformFee.toLocaleString()}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="amount-item total">
                        <span className="fw-bold">Total Amount</span>
                        <span className="fw-bold text-success fs-5">₹{payment.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Timeline Card */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-3">
                      <i className="bi bi-clock-history text-info me-2"></i>
                      Payment Timeline
                    </h5>
                    <div className="timeline">
                      {payment.timeline.map((item, index) => (
                        <div key={index} className="timeline-item">
                          <div className={`timeline-icon bg-${item.color}`}>
                            <i className={`bi ${item.icon}`}></i>
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-title">{item.status}</div>
                            <div className="timeline-time">
                              {new Date(item.time).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default PaymentDetails;
