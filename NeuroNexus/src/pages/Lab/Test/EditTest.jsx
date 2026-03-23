import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import LabNavbar from '../../../components/Navbar/LabNavbar';
import LabSidebar from '../../../components/Sidebar/lab/labSidebar';
import Alert from '../../../components/Alert/Alert';
import { useAlert } from '../../../hooks/useAlert';
import './EditTest.css';

function EditTest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getLabTests, updateTest, currentUser } = useFirebase();
  const { alert, showError, showWarning, showSuccess, closeAlert } = useAlert();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    testName: '',
    category: '',
    description: '',
    price: '',
    installments: 'no',
    noOfInstallments: ''
  });

  const [errors, setErrors] = useState({});

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch test data from Firebase
  useEffect(() => {
    const fetchTestData = async () => {
      if (!currentUser) {
        navigate('/lab/login');
        return;
      }

      try {
        setIsLoading(true);
        const result = await getLabTests(currentUser.uid);
        
        if (result.success && result.tests) {
          const currentTest = result.tests.find(test => test.id === id);

          if (currentTest) {
            setFormData({
              testName: currentTest.testName,
              category: currentTest.category,
              description: currentTest.description,
              price: currentTest.price,
              installments: currentTest.installments,
              noOfInstallments: currentTest.noOfInstallments || ''
            });
          } else {
            showError('Error!', 'Test not found.');
            navigate('/lab/tests');
          }
        } else {
          showError('Error!', 'Failed to load test data.');
          navigate('/lab/tests');
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        showError('Error!', 'Failed to load test data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [id, currentUser, getLabTests, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.testName.trim()) {
      newErrors.testName = 'Test name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (formData.installments === 'yes' && !formData.noOfInstallments) {
      newErrors.noOfInstallments = 'Please specify number of installments';
    } else if (formData.installments === 'yes' && (isNaN(formData.noOfInstallments) || parseInt(formData.noOfInstallments) <= 0)) {
      newErrors.noOfInstallments = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      showWarning('Login Required', 'Please login to update test.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare update data
      const updateData = {
        testName: formData.testName,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        installments: formData.installments
      };

      // Only include noOfInstallments if installments is 'yes'
      if (formData.installments === 'yes') {
        updateData.noOfInstallments = formData.noOfInstallments;
      }

      await updateTest(currentUser.uid, id, updateData);
      showSuccess('Success!', 'Test updated successfully!');
      navigate('/lab/tests');
    } catch (error) {
      console.error('Error updating test:', error);
      setErrors({ submit: error.message || 'Failed to update test. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100">
      <LabSidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <LabNavbar toggleSidebar={toggleSidebar} pageTitle="Edit Test" />
        
        <div className="flex-grow-1 overflow-y-auto">
          <div className="container-fluid p-4">
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-1 fw-bold">Edit Test</h2>
                    <p className="text-muted mb-0">Update test information</p>
                  </div>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/lab/tests')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Tests
                  </button>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    {isLoading && !formData.testName ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading test data...</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                        {/* Test Name */}
                        <div className="col-md-6">
                          <label htmlFor="testName" className="form-label">
                            Test Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.testName ? 'is-invalid' : ''}`}
                            id="testName"
                            name="testName"
                            value={formData.testName}
                            onChange={handleChange}
                            placeholder="Enter test name"
                          />
                          {errors.testName && (
                            <div className="invalid-feedback">{errors.testName}</div>
                          )}
                        </div>

                        {/* Category */}
                        <div className="col-md-6">
                          <label htmlFor="category" className="form-label">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                          >
                            <option value="">Select category</option>
                            <option value="Blood Test">Blood Test</option>
                            <option value="X-Ray">X-Ray</option>
                            <option value="CT Scan">CT Scan</option>
                            <option value="MRI Scan">MRI Scan</option>
                            <option value="Ultrasound">Ultrasound</option>
                            <option value="ECG">ECG</option>
                            <option value="Urine Test">Urine Test</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.category && (
                            <div className="invalid-feedback">{errors.category}</div>
                          )}
                        </div>

                        {/* Description */}
                        <div className="col-12">
                          <label htmlFor="description" className="form-label">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter test description"
                          ></textarea>
                          {errors.description && (
                            <div className="invalid-feedback">{errors.description}</div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="col-md-6">
                          <label htmlFor="price" className="form-label">
                            Price (₹) <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            min="0"
                            step="0.01"
                          />
                          {errors.price && (
                            <div className="invalid-feedback">{errors.price}</div>
                          )}
                        </div>

                        {/* Installments */}
                        <div className="col-md-6">
                          <label htmlFor="installments" className="form-label">
                            Installments Available
                          </label>
                          <select
                            className="form-select"
                            id="installments"
                            name="installments"
                            value={formData.installments}
                            onChange={handleChange}
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>

                        {/* Installment Count (conditional) */}
                        {formData.installments === 'yes' && (
                          <div className="col-md-6">
                            <label htmlFor="noOfInstallments" className="form-label">
                              Number of Installments <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              className={`form-control ${errors.noOfInstallments ? 'is-invalid' : ''}`}
                              id="noOfInstallments"
                              name="noOfInstallments"
                              value={formData.noOfInstallments}
                              onChange={handleChange}
                              placeholder="Enter number of installments"
                              min="2"
                              max="12"
                            />
                            {errors.noOfInstallments && (
                              <div className="invalid-feedback">{errors.noOfInstallments}</div>
                            )}
                          </div>
                        )}

                        {/* Error Message */}
                        {errors.submit && (
                          <div className="col-12">
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                              <i className="bi bi-exclamation-circle me-2"></i>
                              {errors.submit}
                            </div>
                          </div>
                        )}

                        {/* Update Button */}
                        <div className="col-12 mt-4">
                          <button
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Updating Test...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Update Test
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary px-4 ms-2"
                            onClick={() => navigate('/lab/tests')}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      </form>
                    )}
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

export default EditTest;
