import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './DoctorDetails.css';

function DoctorDetails() {
  const { alert, showSuccess, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    // In real app, fetch from Firebase using doctor ID
    // For now, using mock data
    setTimeout(() => {
      setDoctor({
        id: id,
        name: 'Dr. Anita Desai',
        specialization: 'Cardiologist',
        licenseNumber: 'MCI-11111',
        qualification: 'MBBS, MD (Cardiology), FACC',
        experience: '15 years',
        consultationFee: '₹1000',
        phone: '+91 98765 11111',
        email: 'anita.desai@email.com',
        status: 'active',
        rating: 4.8,
        totalPatients: 523,
        totalReviews: 342,
        languages: ['English', 'Hindi', 'Marathi'],
        clinicAddress: 'Apollo Clinic, 123 MG Road, Mumbai, Maharashtra 400001',
        about: 'Dr. Anita Desai is a highly experienced cardiologist with over 15 years of practice. She specializes in interventional cardiology, heart failure management, and preventive cardiology. She has been associated with several prestigious hospitals and has performed thousands of successful procedures.',
        education: [
          { degree: 'MBBS', institution: 'Grant Medical College, Mumbai', year: '2005' },
          { degree: 'MD (Cardiology)', institution: 'AIIMS, New Delhi', year: '2009' },
          { degree: 'Fellowship (FACC)', institution: 'American College of Cardiology', year: '2011' }
        ],
        schedule: [
          { day: 'Monday', morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 08:00 PM' },
          { day: 'Tuesday', morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 08:00 PM' },
          { day: 'Wednesday', morning: '09:00 AM - 01:00 PM', evening: 'Closed' },
          { day: 'Thursday', morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 08:00 PM' },
          { day: 'Friday', morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 08:00 PM' },
          { day: 'Saturday', morning: '10:00 AM - 02:00 PM', evening: 'Closed' },
          { day: 'Sunday', morning: 'Closed', evening: 'Closed' }
        ],
        services: [
          'ECG & Stress Testing',
          'Echocardiography',
          'Angiography',
          'Angioplasty',
          'Pacemaker Implantation',
          'Heart Failure Management',
          'Preventive Cardiology Consultation'
        ],
        achievements: [
          'Best Cardiologist Award 2022 - Mumbai Medical Association',
          'Published 25+ research papers in international journals',
          'Speaker at National Cardiology Conference 2023',
          'Member of Indian Medical Association'
        ],
        registeredDate: '2023-05-15',
        lastActive: '2 hours ago'
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBack = () => {
    navigate('/doctors/approved');
  };

  const handleToggleStatus = () => {
    const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
    setDoctor({ ...doctor, status: newStatus });
    showSuccess('Success!', `Doctor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
  };

  if (loading) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} pageTitle="Doctor Details" />
          <div className="flex-grow-1 overflow-y-auto d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="d-flex vh-100">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} pageTitle="Doctor Details" />
          <div className="flex-grow-1 overflow-y-auto d-flex align-items-center justify-content-center">
            <div className="text-center">
              <i className="bi bi-exclamation-triangle text-warning" style={{fontSize: '48px'}}></i>
              <h5 className="mt-3">Doctor not found</h5>
              <button className="btn btn-primary mt-3" onClick={handleBack}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} pageTitle="Doctor Details" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">
            {/* Back Button */}
            <button className="btn btn-outline-secondary mb-4" onClick={handleBack}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Doctors
            </button>

            {/* Doctor Profile Header */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-8">
                    <div className="d-flex align-items-start">
                      <div className="avatar-circle-xlarge bg-primary bg-opacity-10 text-primary me-4">
                        <i className="bi bi-person-circle"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <h2 className="fw-bold mb-0 me-3">{doctor.name}</h2>
                          <span className={`badge ${doctor.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {doctor.status}
                          </span>
                        </div>
                        <h5 className="text-primary mb-2">{doctor.specialization}</h5>
                        <p className="text-muted mb-2">{doctor.qualification}</p>
                        <div className="d-flex align-items-center gap-4 mb-3">
                          <span className="text-warning">
                            <i className="bi bi-star-fill"></i>
                            <strong> {doctor.rating}</strong> ({doctor.totalReviews} reviews)
                          </span>
                          <span className="text-muted">
                            <i className="bi bi-people"></i>
                            <strong> {doctor.totalPatients}</strong> patients
                          </span>
                          <span className="text-muted">
                            <i className="bi bi-briefcase"></i>
                            <strong> {doctor.experience}</strong> experience
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          {doctor.languages.map((lang, index) => (
                            <span key={index} className="badge bg-light text-dark">{lang}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <h3 className="text-success fw-bold mb-3">{doctor.consultationFee}</h3>
                    <p className="text-muted small mb-3">Consultation Fee</p>
                    <button
                      className={`btn ${doctor.status === 'active' ? 'btn-warning' : 'btn-success'} w-100 mb-2`}
                      onClick={handleToggleStatus}
                    >
                      <i className={`bi ${doctor.status === 'active' ? 'bi-pause-circle' : 'bi-play-circle'} me-2`}></i>
                      {doctor.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-outline-primary w-100">
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Left Column */}
              <div className="col-lg-8">
                {/* About Section */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-person-lines-fill text-primary me-2"></i>
                      About Doctor
                    </h5>
                    <p className="text-muted">{doctor.about}</p>
                  </div>
                </div>

                {/* Education Section */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-mortarboard text-primary me-2"></i>
                      Education & Qualifications
                    </h5>
                    {doctor.education.map((edu, index) => (
                      <div key={index} className="d-flex align-items-start mb-3">
                        <div className="icon-circle bg-primary bg-opacity-10 text-primary me-3">
                          <i className="bi bi-award"></i>
                        </div>
                        <div>
                          <h6 className="fw-semibold mb-1">{edu.degree}</h6>
                          <p className="text-muted small mb-0">{edu.institution}</p>
                          <p className="text-muted small mb-0">Year: {edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Section */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-heart-pulse text-primary me-2"></i>
                      Services Offered
                    </h5>
                    <div className="row g-2">
                      {doctor.services.map((service, index) => (
                        <div key={index} className="col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            <span>{service}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-trophy text-primary me-2"></i>
                      Achievements & Recognition
                    </h5>
                    {doctor.achievements.map((achievement, index) => (
                      <div key={index} className="d-flex align-items-start mb-2">
                        <i className="bi bi-star-fill text-warning me-2 mt-1"></i>
                        <span>{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4">
                {/* Contact Information */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-telephone text-primary me-2"></i>
                      Contact Information
                    </h5>
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Phone</small>
                      <a href={`tel:${doctor.phone}`} className="text-decoration-none">
                        <i className="bi bi-phone me-2"></i>{doctor.phone}
                      </a>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Email</small>
                      <a href={`mailto:${doctor.email}`} className="text-decoration-none">
                        <i className="bi bi-envelope me-2"></i>{doctor.email}
                      </a>
                    </div>
                    <div>
                      <small className="text-muted d-block mb-1">License Number</small>
                      <code>{doctor.licenseNumber}</code>
                    </div>
                  </div>
                </div>

                {/* Clinic Address */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-geo-alt text-primary me-2"></i>
                      Clinic Address
                    </h5>
                    <p className="text-muted mb-0">{doctor.clinicAddress}</p>
                    <button className="btn btn-outline-primary btn-sm w-100 mt-3">
                      <i className="bi bi-map me-2"></i>
                      View on Map
                    </button>
                  </div>
                </div>

                {/* Schedule */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-calendar-week text-primary me-2"></i>
                      Clinic Timings
                    </h5>
                    {doctor.schedule.map((slot, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <strong className="text-muted">{slot.day}</strong>
                        <div className="text-end">
                          <small className="d-block">{slot.morning}</small>
                          <small className="d-block">{slot.evening}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registration Info */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-info-circle text-primary me-2"></i>
                      Registration Info
                    </h5>
                    <div className="mb-2">
                      <small className="text-muted">Registered Date</small>
                      <p className="mb-0">{new Date(doctor.registeredDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <small className="text-muted">Last Active</small>
                      <p className="mb-0">{doctor.lastActive}</p>
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

export default DoctorDetails;