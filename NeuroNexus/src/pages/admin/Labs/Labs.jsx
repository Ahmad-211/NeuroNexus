import { useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import PendingLabs from './PendingLabsContent';
import ApprovedLabs from './ApprovedLabsContent';
import './Labs.css';

function Labs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <main className="main-content">
        <div className="page-container">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Laboratory Management</h1>
              <p className="page-subtitle">
                Review, approve, and manage laboratory registrations
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="tabs-container">
            <div className="tabs-nav">
              <button
                className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Pending Labs
              </button>
              <button
                className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Approved Labs
              </button>
            </div>

            {/* Tab Content */}
            <div className="tabs-content">
              {activeTab === 'pending' ? <PendingLabs /> : <ApprovedLabs />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Labs;
