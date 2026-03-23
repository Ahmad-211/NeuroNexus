import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleLabLogin = () => {
    navigate('/lab/login');
  };

  const handleGetStarted = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLearnMore = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFAQ = (index) => {
    const faqItem = document.getElementById(`faq-${index}`);
    const isOpen = faqItem.style.maxHeight;
    
    // Close all FAQs
    document.querySelectorAll('.faq-answer').forEach(item => {
      item.style.maxHeight = null;
      item.previousElementSibling.classList.remove('active');
    });
    
    // Open clicked FAQ if it was closed
    if (!isOpen) {
      faqItem.style.maxHeight = faqItem.scrollHeight + 'px';
      faqItem.previousElementSibling.classList.add('active');
    }
  };

  return (
    <div className="landing-page">
      {/* Sticky Navigation */}
      <nav className="navbar-landing sticky-top">
        <div className="container">
          <div className="nav-content">
            <div className="nav-logo">
              <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" />
              <span>NeuroNexus</span>
            </div>
            <ul className="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <button className="btn-lab-login" onClick={handleLabLogin}>
              <i className="bi bi-box-arrow-in-right me-2"></i>
               Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-gradient"></div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 animate-on-scroll">
              <div className="hero-content">
                <div className="hero-text-buttons">
                  <h1 className="hero-title">
                    <span className="welcome-text">Welcome to</span>
                    <span className="gradient-text">NeuroNexus</span>
                  </h1>
                  <p className="hero-subtitle">
                    Revolutionizing Healthcare with AI-Powered Laboratory Management. 
                    Seamless diagnostics, instant results, and intelligent insights for a healthier tomorrow.
                  </p>
                  <div className="hero-buttons">
                    <button className="btn-primary-hero" onClick={handleGetStarted}>
                      Get Started
                      <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                    <button className="btn-secondary-hero" onClick={handleLearnMore}>
                      Learn More
                      <i className="bi bi-play-circle ms-2"></i>
                    </button>
                  </div>
                  <div className="hero-stats">
                    <div className="stat-item">
                      <h3>500+</h3>
                      <p>Labs Connected</p>
                    </div>
                    <div className="stat-item">
                      <h3>1M+</h3>
                      <p>Tests Processed</p>
                    </div>
                    <div className="stat-item">
                      <h3>99.9%</h3>
                      <p>Accuracy Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-on-scroll">
              <div className="hero-illustration">
                <div className="floating-card card-1">
                  <i className="bi bi-shield-check"></i>
                  <span>Secure & Encrypted</span>
                </div>
                <div className="floating-card card-2">
                  <i className="bi bi-lightning-charge"></i>
                  <span>Lightning Fast</span>
                </div>
                <div className="floating-card card-3">
                  <i className="bi bi-graph-up"></i>
                  <span>Real-time Analytics</span>
                </div>
                <div className="hero-graphic">
                  <div className="pulse-ring"></div>
                  <div className="pulse-ring delay-1"></div>
                  <div className="pulse-ring delay-2"></div>
                  <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" className="hero-icon" style={{ width: '150px', height: '150px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Experience the future of laboratory management</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="feature-card">
                <div className="feature-icon blue">
                  <i className="bi bi-robot"></i>
                </div>
                <h3>AI-Powered Diagnostics</h3>
                <p>Advanced machine learning algorithms for accurate test analysis and predictions</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="feature-card">
                <div className="feature-icon purple">
                  <i className="bi bi-speedometer2"></i>
                </div>
                <h3>Real-Time Results</h3>
                <p>Get instant notifications and access to test results within minutes</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="feature-card">
                <div className="feature-icon pink">
                  <i className="bi bi-cloud-check"></i>
                </div>
                <h3>Cloud Storage</h3>
                <p>Secure cloud-based storage for all your medical records and reports</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="feature-card">
                <div className="feature-icon cyan">
                  <i className="bi bi-phone"></i>
                </div>
                <h3>Mobile Access</h3>
                <p>Access your health data anytime, anywhere from any device</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="feature-card">
                <div className="feature-icon orange">
                  <i className="bi bi-shield-lock"></i>
                </div>
                <h3>HIPAA Compliant</h3>
                <p>Enterprise-grade security ensuring complete data privacy and protection</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="feature-card">
                <div className="feature-icon green">
                  <i className="bi bi-people"></i>
                </div>
                <h3>24/7 Support</h3>
                <p>Round-the-clock customer support and technical assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 animate-on-scroll">
              <div className="about-graphic">
                <div className="about-shape shape-1"></div>
                <div className="about-shape shape-2"></div>
                <div className="about-content-graphic">
                  <i className="bi bi-bullseye"></i>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-on-scroll">
              <div className="about-content">
                <h2 className="section-title">About NeuroNexus</h2>
                <p className="about-text">
                  NeuroNexus is a cutting-edge healthcare technology platform that bridges the gap between 
                  laboratories and patients. Founded with a vision to democratize healthcare access, we leverage 
                  artificial intelligence and cloud computing to deliver faster, more accurate diagnostic services.
                </p>
                <p className="about-text">
                  Our mission is to empower healthcare providers with intelligent tools that streamline workflows, 
                  reduce errors, and improve patient outcomes. We believe in making quality healthcare accessible 
                  to everyone, everywhere.
                </p>
                <div className="mission-vision">
                  <div className="mv-item">
                    <div className="mv-icon">
                      <i className="bi bi-crosshair"></i>
                    </div>
                    <div>
                      <h4>Our Mission</h4>
                      <p>Transform healthcare delivery through innovative technology and AI-driven solutions</p>
                    </div>
                  </div>
                  <div className="mv-item">
                    <div className="mv-icon">
                      <i className="bi bi-eye"></i>
                    </div>
                    <div>
                      <h4>Our Vision</h4>
                      <p>A world where quality healthcare is accessible, affordable, and intelligent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Comprehensive solutions for modern healthcare</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-code-slash"></i>
                </div>
                <h3>Lab Management System</h3>
                <p>Complete digital solution for laboratory operations, bookings, and inventory management</p>
                <button className="btn-learn-more">
                  Learn More <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-phone"></i>
                </div>
                <h3>Mobile Applications</h3>
                <p>Native iOS and Android apps for patients and healthcare providers with real-time updates</p>
                <button className="btn-learn-more">
                  Learn More <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-cpu"></i>
                </div>
                <h3>AI Diagnostic Tools</h3>
                <p>Machine learning models for pattern recognition, anomaly detection, and predictive analytics</p>
                <button className="btn-learn-more">
                  Learn More <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-gear"></i>
                </div>
                <h3>Automation Software</h3>
                <p>Streamline workflows with automated report generation, notifications, and data processing</p>
                <button className="btn-learn-more">
                  Learn More <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-cloud"></i>
                </div>
                <h3>Cloud & Analytics</h3>
                <p>Scalable cloud infrastructure with advanced analytics and business intelligence dashboards</p>
                <button className="btn-learn-more">
                  Learn More <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="service-card">
                <div className="service-icon">
                  <i className="bi bi-headset"></i>
                </div>
                <h3>Consultation Platform</h3>
                <p>Telemedicine integration for virtual consultations and remote patient monitoring</p>
                <button className="btn-learn-more">
                  Learn More <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title">Why Choose NeuroNexus</h2>
            <p className="section-subtitle">Leading the healthcare technology revolution</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-6 animate-on-scroll">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Innovation First</h4>
                  <p>Cutting-edge AI technology and continuous product improvements</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-on-scroll">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Lightning Speed</h4>
                  <p>Get results in minutes, not days, with our optimized systems</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-on-scroll">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Expert Support</h4>
                  <p>Dedicated customer success team available 24/7 for assistance</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-on-scroll">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Affordable Pricing</h4>
                  <p>Transparent pricing with flexible plans that scale with your needs</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-on-scroll">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Trusted Security</h4>
                  <p>Bank-level encryption and HIPAA compliance for data protection</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-on-scroll">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Proven Results</h4>
                  <p>Trusted by 500+ labs with 99.9% accuracy and satisfaction rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle">Real feedback from healthcare professionals</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="testimonial-card">
                <div className="stars">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <p className="testimonial-text">
                  "NeuroNexus has completely transformed our lab operations. The AI-powered diagnostics 
                  have improved our accuracy and reduced processing time by 70%."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h5>Dr. Rajesh Kumar</h5>
                    <p>Chief Pathologist, Apollo Diagnostics</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="testimonial-card">
                <div className="stars">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <p className="testimonial-text">
                  "The mobile app is incredibly user-friendly. Our patients love getting instant 
                  notifications about their test results. Customer support is also outstanding!"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h5>Dr. Priya Sharma</h5>
                    <p>Lab Director, Max Healthcare</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 animate-on-scroll">
              <div className="testimonial-card">
                <div className="stars">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <p className="testimonial-text">
                  "Switching to NeuroNexus was the best decision. The automation features have saved 
                  us countless hours, and the analytics help us make better business decisions."
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h5>Amit Patel</h5>
                    <p>CEO, LifeCare Laboratories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Everything you need to know about NeuroNexus</p>
          </div>
          <div className="faq-container animate-on-scroll">
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(1)}>
                <h4>What is NeuroNexus and how does it work?</h4>
                <i className="bi bi-chevron-down"></i>
              </div>
              <div className="faq-answer" id="faq-1">
                <p>
                  NeuroNexus is a comprehensive laboratory management platform that connects patients, 
                  doctors, and laboratories through AI-powered technology. It streamlines the entire 
                  diagnostic process from booking to results delivery, ensuring accuracy and efficiency.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(2)}>
                <h4>Is my medical data secure on NeuroNexus?</h4>
                <i className="bi bi-chevron-down"></i>
              </div>
              <div className="faq-answer" id="faq-2">
                <p>
                  Absolutely! We use bank-level 256-bit encryption and are fully HIPAA compliant. 
                  All data is stored securely in the cloud with multiple layers of security and 
                  regular security audits to ensure your information remains private.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(3)}>
                <h4>How quickly can I get my test results?</h4>
                <i className="bi bi-chevron-down"></i>
              </div>
              <div className="faq-answer" id="faq-3">
                <p>
                  Most test results are available within minutes to a few hours, depending on the 
                  test type. You'll receive instant notifications via SMS and email when your 
                  results are ready, and can access them through our mobile app or web portal.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(4)}>
                <h4>What types of laboratories can use NeuroNexus?</h4>
                <i className="bi bi-chevron-down"></i>
              </div>
              <div className="faq-answer" id="faq-4">
                <p>
                  NeuroNexus is designed for all types of diagnostic laboratories - from small 
                  independent clinics to large hospital chains. Our platform scales with your 
                  needs and can handle everything from basic blood tests to advanced imaging.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(5)}>
                <h4>Do you offer customer support and training?</h4>
                <i className="bi bi-chevron-down"></i>
              </div>
              <div className="faq-answer" id="faq-5">
                <p>
                  Yes! We provide 24/7 customer support via phone, email, and live chat. We also 
                  offer comprehensive onboarding training, documentation, video tutorials, and 
                  ongoing support to ensure your team gets the most out of NeuroNexus.
                </p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(6)}>
                <h4>What are the pricing plans for NeuroNexus?</h4>
                <i className="bi bi-chevron-down"></i>
              </div>
              <div className="faq-answer" id="faq-6">
                <p>
                  We offer flexible pricing plans based on your laboratory size and needs. 
                  Our plans include a free tier for small clinics, professional plans for 
                  medium-sized labs, and enterprise solutions for large organizations. 
                  Contact our sales team for a custom quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content animate-on-scroll">
            <h2>Ready to Transform Your Laboratory?</h2>
            <p>Join 500+ laboratories already using NeuroNexus to deliver faster, smarter healthcare</p>
            <button className="btn-cta" onClick={() => navigate('/lab/login')}>
              Get Started with NeuroNexus
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="footer-brand">
                <div className="footer-logo">
                  <img src="/assets/images/logo_icon.png" alt="NeuroNexus Logo" />
                  <span>NeuroNexus</span>
                </div>
                <p>
                  Revolutionizing healthcare with AI-powered laboratory management solutions. 
                  Making quality diagnostics accessible to everyone, everywhere.
                </p>
                <div className="social-links">
                  <a href="#"><i className="bi bi-facebook"></i></a>
                  <a href="#"><i className="bi bi-twitter"></i></a>
                  <a href="#"><i className="bi bi-linkedin"></i></a>
                  <a href="#"><i className="bi bi-instagram"></i></a>
                  <a href="#"><i className="bi bi-youtube"></i></a>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4">
              <h5>Quick Links</h5>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4">
              <h5>Services</h5>
              <ul className="footer-links">
                <li><a href="#">Lab Management</a></li>
                <li><a href="#">Mobile Apps</a></li>
                <li><a href="#">AI Tools</a></li>
                <li><a href="#">Analytics</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-4">
              <h5>Contact Us</h5>
              <ul className="footer-contact">
                <li>
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>123 Tech Park, Bangalore, India</span>
                </li>
                <li>
                  <i className="bi bi-telephone-fill"></i>
                  <span>+91 1800 123 4567</span>
                </li>
                <li>
                  <i className="bi bi-envelope-fill"></i>
                  <span>contact@neuronexus.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 NeuroNexus. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
