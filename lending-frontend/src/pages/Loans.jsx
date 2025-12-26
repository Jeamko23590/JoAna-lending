import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchLoans();
  }, [search, status]);

  const fetchLoans = async (page = 1) => {
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await api.get('/loans', { params });
      setLoans(response.data.data);
      setPagination(response.data);
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      ongoing: 'primary',
      fully_paid: 'success',
      overdue: 'danger',
    };
    return colors[status] || 'secondary';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan?')) return;

    try {
      await api.delete(`/loans/${id}`);
      toast.success('Loan deleted');
      fetchLoans();
    } catch (error) {
      toast.error('Failed to delete loan');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h4 className="page-title">Loans</h4>
        <div className="page-header-actions">
          <Link to="/loans/new" className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i> New Loan
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
                placeholder="Search borrower..."
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
                <option value="ongoing">Ongoing</option>
                <option value="fully_paid">Fully Paid</option>
                <option value="overdue">Overdue</option>
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
                      <th>Borrower</th>
                      <th>Amount</th>
                      <th>Balance</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th style={{width: '120px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="fw-bold">{loan.borrower?.full_name}</td>
                        <td>{formatCurrency(loan.loan_amount)}</td>
                        <td className="text-danger">{formatCurrency(loan.remaining_balance)}</td>
                        <td>{formatDate(loan.due_date)}</td>
                        <td>
                          <span className={`badge bg-${getStatusBadge(loan.status)}`}>
                            {loan.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link to={`/loans/${loan.id}`} className="btn btn-sm btn-outline-info">
                              <i className="bi bi-eye"></i>
                            </Link>
                            <Link to={`/loans/${loan.id}/edit`} className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(loan.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loans.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No loans found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none">
                {loans.map((loan) => (
                  <div key={loan.id} className="mobile-card">
                    <div className="mobile-card-header">
                      <h6 className="mobile-card-title">{loan.borrower?.full_name}</h6>
                      <span className={`badge bg-${getStatusBadge(loan.status)}`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mobile-card-body">
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Amount</span>
                        <strong>{formatCurrency(loan.loan_amount)}</strong>
                      </div>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Balance</span>
                        <strong className="text-danger">{formatCurrency(loan.remaining_balance)}</strong>
                      </div>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Due Date</span>
                        <span>{formatDate(loan.due_date)}</span>
                      </div>
                    </div>
                    <div className="mobile-card-actions">
                      <Link to={`/loans/${loan.id}`} className="btn btn-sm btn-info">
                        <i className="bi bi-eye me-1"></i> View
                      </Link>
                      <Link to={`/loans/${loan.id}/edit`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(loan.id)}
                        style={{flex: 'none', width: 'auto'}}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {loans.length === 0 && (
                  <div className="text-center py-4 text-muted">No loans found</div>
                )}
              </div>
            </>
          )}

          {pagination.last_page > 1 && (
            <nav className="mt-3">
              <ul className="pagination pagination-sm justify-content-center mb-0 flex-wrap gap-1">
                {[...Array(pagination.last_page)].map((_, i) => (
                  <li key={i} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => fetchLoans(i + 1)}>
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

export default Loans;
