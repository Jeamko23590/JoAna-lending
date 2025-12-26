import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchPayments();
  }, [dateFrom, dateTo]);

  const fetchPayments = async (page = 1) => {
    try {
      const params = { page, per_page: 15 };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.get('/payments', { params });
      setPayments(response.data.data);
      setPagination(response.data);
    } catch (error) {
      toast.error('Failed to load payments');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;

    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  const printReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/reports/receipt/${paymentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div>
      <div className="page-header">
        <h4 className="page-title">Payments</h4>
      </div>

      <div className="card">
        <div className="card-body">
          {/* Filters */}
          <div className="row g-2 mb-3 filter-section">
            <div className="col-6 col-md-3">
              <label className="form-label small">From</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small">To</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                Clear
              </button>
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
                      <th>Date</th>
                      <th>Borrower</th>
                      <th>Amount</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th style={{width: '100px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.payment_date)}</td>
                        <td>
                          <Link to={`/loans/${payment.loan_id}`} className="text-decoration-none">
                            {payment.loan?.borrower?.full_name}
                          </Link>
                        </td>
                        <td className="fw-bold text-success">{formatCurrency(payment.amount_paid)}</td>
                        <td>{formatCurrency(payment.balance_after)}</td>
                        <td>
                          <span className={`badge bg-${payment.is_late ? 'warning' : 'success'}`}>
                            {payment.is_late ? 'Late' : 'On Time'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => printReceipt(payment.id)}
                            >
                              <i className="bi bi-printer"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(payment.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none">
                {payments.map((payment) => (
                  <div key={payment.id} className="mobile-card">
                    <div className="mobile-card-header">
                      <div>
                        <Link to={`/loans/${payment.loan_id}`} className="text-decoration-none">
                          <h6 className="mobile-card-title">{payment.loan?.borrower?.full_name}</h6>
                        </Link>
                        <small className="text-muted">{formatDate(payment.payment_date)}</small>
                      </div>
                      <span className={`badge bg-${payment.is_late ? 'warning' : 'success'}`}>
                        {payment.is_late ? 'Late' : 'On Time'}
                      </span>
                    </div>
                    <div className="mobile-card-body">
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Amount Paid</span>
                        <strong className="text-success">{formatCurrency(payment.amount_paid)}</strong>
                      </div>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Balance After</span>
                        <span>{formatCurrency(payment.balance_after)}</span>
                      </div>
                    </div>
                    <div className="mobile-card-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => printReceipt(payment.id)}
                      >
                        <i className="bi bi-printer me-1"></i> Receipt
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(payment.id)}
                        style={{flex: 'none'}}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="text-center py-4 text-muted">No payments found</div>
                )}
              </div>
            </>
          )}

          {pagination.last_page > 1 && (
            <nav className="mt-3">
              <ul className="pagination pagination-sm justify-content-center mb-0 flex-wrap gap-1">
                {[...Array(pagination.last_page)].map((_, i) => (
                  <li key={i} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => fetchPayments(i + 1)}>
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

export default Payments;
