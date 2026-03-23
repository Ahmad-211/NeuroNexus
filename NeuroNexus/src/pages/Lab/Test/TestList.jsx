import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './TestList.css';

function TestList() {
  const navigate = useNavigate();
  const { getLabTests, deleteTest, currentUser, loading } = useFirebase();
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tests from Firebase
  useEffect(() => {
    const fetchTests = async () => {
      // Wait for Firebase auth to initialize
      if (loading) {
        return;
      }

      if (!currentUser) {
        navigate('/lab/login');
        return;
      }

      try {
        setIsLoading(true);
        const result = await getLabTests(currentUser.uid);
        if (result.success) {
          setTests(result.tests || []);
        } else {
          console.error('Error fetching tests:', result.error);
          setTests([]);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
        setTests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [currentUser, loading, getLabTests, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Filter tests based on search query
  const filteredTests = tests.filter(test =>
    test.testName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete
  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    try {
      await deleteTest(currentUser.uid, testId);
      setTests(tests.filter(test => test.id !== testId));
      showSuccess('Success!', 'Test deleted successfully!');
    } catch (error) {
      console.error('Error deleting test:', error);
      showError('Error!', 'Failed to delete test. Please try again.');
    }
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Test Management" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h2 className="mb-1 fw-bold">Test Management</h2>
                <p className="text-muted mb-0">Manage all medical tests</p>
              </div>
              <div className="col-md-6 text-md-end">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/lab/tests/add')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Test
                </button>
              </div>
            </div>

            {/* Search and Filter Card */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search by test name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <span className="text-muted">
                          Showing {filteredTests.length} of {tests.length} tests
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tests Table Card */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">Test Name</th>
                            <th className="py-3">Category</th>
                            <th className="py-3">Price (₹)</th>
                            <th className="py-3">Installments</th>
                            <th className="py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td colSpan="5" className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mt-2 mb-0">Loading tests...</p>
                              </td>
                            </tr>
                          ) : filteredTests.length > 0 ? (
                            filteredTests.map((test) => (
                              <tr key={test.id}>
                                <td className="px-4 py-3">
                                  <div className="d-flex align-items-center">
                                    <div className="test-icon me-3">
                                      <i className="bi bi-heart-pulse-fill"></i>
                                    </div>
                                    <div>
                                      <div className="fw-semibold text-dark">{test.testName}</div>
                                      <small className="text-muted">Test ID: {test.id}</small>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span className="badge bg-primary-subtle text-primary">
                                    {test.category}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="fw-semibold">₹{test.price}</span>
                                </td>
                                <td className="py-3">
                                  {test.installments === 'yes' ? (
                                    <span className="badge bg-success-subtle text-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Yes ({test.noOfInstallments})
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary-subtle text-secondary">
                                      <i className="bi bi-x-circle me-1"></i>
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 text-center">
                                  <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => navigate(`/lab/tests/edit/${test.id}`)}
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(test.id)}
                                  >
                                    <i className="bi bi-trash3"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-5">
                                <div className="text-muted">
                                  <i className="bi bi-search fs-1 d-block mb-3"></i>
                                  <p className="mb-0">No tests found matching your search</p>
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

export default TestList;
