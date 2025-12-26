import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const BorrowerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    contact_number: '',
    notes: '',
    status: 'active',
  });
  const [validId, setValidId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) fetchBorrower();
  }, [id]);

  const fetchBorrower = async () => {
    try {
      const response = await api.get(`/borrowers/${id}`);
      const { full_name, address, contact_number, notes, status } = response.data;
      setFormData({ full_name, address, contact_number, notes: notes || '', status });
    } catch (error) {
      toast.error('Failed to load borrower');
      navigate('/borrowers');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (validId) data.append('valid_id', validId);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEdit) {
        data.append('_method', 'PUT');
        await api.post(`/borrowers/${id}`, data, config);
        toast.success('Borrower updated');
      } else {
        await api.post('/borrowers', data, config);
        toast.success('Borrower created');
      }
      navigate('/borrowers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save borrower');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h4 className="page-title">{isEdit ? 'Edit Borrower' : 'Add Borrower'}</h4>
        <div className="page-header-actions">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/borrowers')}>
            Cancel
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Contact Number *</label>
                <input
                  type="text"
                  className="form-control"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="09123456789"
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Complete address"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Valid ID</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,.pdf"
                  onChange={(e) => setValidId(e.target.files[0])}
                />
                <small className="text-muted">Image or PDF</small>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-primary w-100 w-md-auto" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i>
                    {isEdit ? 'Update' : 'Save'} Borrower
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowerForm;
