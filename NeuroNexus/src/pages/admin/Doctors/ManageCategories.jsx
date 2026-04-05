import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../../../context/Firebase';
import Navbar from '../../../components/Navbar/Navbar';
import Sidebar from '../../../components/Sidebar/Sidebar';
import './ManageCategories.css';

function ManageCategories() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const {
    getDoctorCategories,
    addDoctorCategory,
    removeDoctorCategory,
    updateDoctorCategory,
    initializeDoctorCategories,
    loading,
  } = useFirebase();

  useEffect(() => {
    if (!loading) {
      loadCategories();
    }
  }, [loading]);

  const loadCategories = async () => {
    setIsLoading(true);
    await initializeDoctorCategories();
    const result = await getDoctorCategories();
    if (result.success) {
      setCategories(result.categories);
    }
    setIsLoading(false);
  };

  // ── Add ───────────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!newCategoryName.trim()) {
      setAddError('Category name cannot be empty.');
      return;
    }
    setIsAdding(true);
    const result = await addDoctorCategory(newCategoryName);
    if (result.success) {
      setNewCategoryName('');
      setAddSuccess('Category added successfully!');
      await loadCategories();
      setTimeout(() => setAddSuccess(''), 3000);
    } else {
      setAddError(result.error);
    }
    setIsAdding(false);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditError('');
  };

  const saveEdit = async (id) => {
    setEditError('');
    setIsSaving(true);
    const result = await updateDoctorCategory(id, editingName);
    if (result.success) {
      await loadCategories();
      setEditingId(null);
    } else {
      setEditError(result.error);
    }
    setIsSaving(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const result = await removeDoctorCategory(id);
    if (result.success) {
      setDeletingId(null);
      await loadCategories();
    }
  };

  return (
    <div className="d-flex vh-100">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} pageTitle="Manage Categories" />

        <div className="flex-grow-1 overflow-y-auto">
          <div className="w-100 p-4">

            {/* Header */}
            <div className="row mb-4 align-items-center">
              <div className="col">
                <h2 className="fw-bold mb-1">Manage Doctor Categories</h2>
                <p className="text-muted mb-0">
                  Add, edit, or remove doctor specialization categories stored in Firebase.
                </p>
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/doctors/approved')}
                >
                  <i className="bi bi-arrow-left me-2"></i>Back to Doctors
                </button>
              </div>
            </div>

            {/* Add Category Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-plus-circle text-success me-2"></i>Add New Category
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleAdd} className="d-flex gap-3 align-items-start">
                  <div className="flex-grow-1">
                    <input
                      type="text"
                      className={`form-control ${addError ? 'is-invalid' : ''}`}
                      placeholder="e.g. Hepatology"
                      value={newCategoryName}
                      onChange={(e) => { setNewCategoryName(e.target.value); setAddError(''); }}
                    />
                    {addError && <div className="invalid-feedback">{addError}</div>}
                    {addSuccess && <div className="text-success small mt-1">{addSuccess}</div>}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={isAdding}
                  >
                    {isAdding
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Adding…</>
                      : <><i className="bi bi-plus-lg me-1"></i>Add</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Categories List */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-tags text-primary me-2"></i>All Categories
                </h5>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                  {categories.length} Total
                </span>
              </div>

              {isLoading ? (
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading…</span>
                  </div>
                  <p className="mt-3 text-muted">Loading categories…</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '48px' }}></i>
                  <h5 className="mt-3 text-muted">No categories yet</h5>
                  <p className="text-muted">Add your first category using the form above.</p>
                </div>
              ) : (
                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    {categories.map((cat, index) => (
                      <li
                        key={cat.id}
                        className="list-group-item px-4 py-3 category-item"
                      >
                        <div className="d-flex align-items-center gap-3">
                          {/* Index badge */}
                          <span className="category-index">{index + 1}</span>

                          {/* Name / Edit input */}
                          {editingId === cat.id ? (
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className={`form-control form-control-sm ${editError ? 'is-invalid' : ''}`}
                                value={editingName}
                                onChange={(e) => { setEditingName(e.target.value); setEditError(''); }}
                                autoFocus
                              />
                              {editError && <div className="invalid-feedback">{editError}</div>}
                            </div>
                          ) : (
                            <span className="flex-grow-1 fw-medium category-name">{cat.name}</span>
                          )}

                          {/* Action buttons */}
                          {editingId === cat.id ? (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => saveEdit(cat.id)}
                                disabled={isSaving}
                              >
                                {isSaving
                                  ? <span className="spinner-border spinner-border-sm"></span>
                                  : <i className="bi bi-check-lg"></i>}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={cancelEdit}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Edit"
                                onClick={() => startEdit(cat)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                onClick={() => setDeletingId(cat.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-danger fw-semibold">
                  <i className="bi bi-exclamation-triangle me-2"></i>Delete Category
                </h5>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-0">
                  Are you sure you want to delete{' '}
                  <strong>{categories.find(c => c.id === deletingId)?.name}</strong>?
                  This cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0 gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setDeletingId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(deletingId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCategories;
