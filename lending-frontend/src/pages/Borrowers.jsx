import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchBorrowers();
  }, [search, status]);

  const fetchBorrowers = async (page = 1) => {
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await api.get('/borrowers', { params });
      setBorrowers(response.data.data);
      setPagination(response.data);
    } catch (error) {
      toast.error('Failed to load borrowers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this borrower?')) return;

    try {
      await api.delete(`/borrowers/${id}`);
      toast.success('Borrower deleted');
      fetchBorrowers();
    } catch (error) {
      toast.error('Failed to delete borrower');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h4 className="page-title">Borrowers</h4>
        <div className="page-header-actions">
          <Link to="/borrowers/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i> Add Borrower
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {/* Filters */}
          <div className="row g-2 mb-3 filter-section">
            <div className="col-12 col-sm-6 col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Search name or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Loans</th>
                      <th>Status</th>
                      <th style={{width: '100px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowers.map((borrower) => (
                      <tr key={borrower.id}>
                        <td className="fw-bold">{borrower.full_name}</td>
                        <td>{borrower.contact_number}</td>
                        <td className="text-truncate" style={{maxWidth: '200px'}}>{borrower.address}</td>
                        <td>{borrower.active_loans_count || 0}</td>
                        <td>
                          <span className={`badge bg-${borrower.status === 'active' ? 'success' : 'secondary'}`}>
                            {borrower.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link to={`/borrowers/${borrower.id}/edit`} className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(borrower.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {borrowers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No borrowers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none">
                {borrowers.map((borrower) => (
                  <div key={borrower.id} className="mobile-card">
                    <div className="mobile-card-header">
                      <div>
                        <h6 className="mobile-card-title">{borrower.full_name}</h6>
                        <small className="text-muted">
                          <i className="bi bi-telephone me-1"></i>
                          {borrower.contact_number}
                        </small>
                      </div>
                      <span className={`badge bg-${borrower.status === 'active' ? 'success' : 'secondary'}`}>
                        {borrower.status}
                      </span>
                    </div>
                    <div className="mobile-card-body">
                      <p className="small text-muted mb-2 text-truncate-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        {borrower.address}
                      </p>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Active Loans</span>
                        <strong>{borrower.active_loans_count || 0}</strong>
                      </div>
                    </div>
                    <div className="mobile-card-actions">
                      <Link to={`/borrowers/${borrower.id}/edit`} className="btn btn-sm btn-primary">
                        <i className="bi bi-pencil me-1"></i> Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(borrower.id)}
                        style={{flex: 'none'}}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {borrowers.length === 0 && (
                  <div className="text-center py-4 text-muted">No borrowers found</div>
                )}
              </div>
            </>
          )}

          {pagination.last_page > 1 && (
            <nav className="mt-3">
              <ul className="pagination pagination-sm justify-content-center mb-0 flex-wrap gap-1">
                {[...Array(pagination.last_page)].map((_, i) => (
                  <li key={i} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => fetchBorrowers(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default Borrowers;
