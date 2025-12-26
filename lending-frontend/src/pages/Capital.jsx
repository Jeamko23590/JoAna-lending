import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Capital = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('deposit');
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async (page = 1) => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.get('/capital/balance'),
        api.get('/capital', { params: { page, per_page: 15, type: filter || undefined } }),
      ]);
      setBalance(balanceRes.data);
      setTransactions(transactionsRes.data.data);
      setPagination(transactionsRes.data);
    } catch (error) {
      toast.error('Failed to load capital data');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openModal = (type) => {
    setModalType(type);
    setFormData({ amount: '', description: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const endpoint = modalType === 'deposit' ? '/capital/deposit' : '/capital/withdraw';
      await api.post(endpoint, formData);
      toast.success(`Capital ${modalType === 'deposit' ? 'added' : 'withdrawn'}`);
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${modalType}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeInfo = (type) => {
    const types = {
      deposit: { text: 'Deposit', color: 'success', icon: 'bi-plus-circle' },
      withdrawal: { text: 'Withdrawal', color: 'danger', icon: 'bi-dash-circle' },
      loan_release: { text: 'Loan Released', color: 'warning', icon: 'bi-arrow-up-circle' },
      payment_received: { text: 'Payment', color: 'info', icon: 'bi-arrow-down-circle' },
    };
    return types[type] || { text: type, color: 'secondary', icon: 'bi-circle' };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h4 className="page-title">Capital</h4>
        <div className="page-header-actions">
          <button className="btn btn-success" onClick={() => openModal('deposit')}>
            <i className="bi bi-plus-lg me-1"></i> Add
          </button>
          <button className="btn btn-outline-danger" onClick={() => openModal('withdraw')}>
            <i className="bi bi-dash-lg me-1"></i> Withdraw
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="card mb-3" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)' }}>
        <div className="card-body text-white text-center py-4">
          <i className="bi bi-wallet2 fs-1 mb-2 opacity-75"></i>
          <h6 className="mb-1 opacity-75">Available Capital</h6>
          <h2 className="mb-0">{formatCurrency(balance?.current_balance)}</h2>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3">
          <div className="card">
            <div className="card-body text-center py-2">
              <small className="text-muted d-block">Deposits</small>
              <strong className="text-success">{formatCurrency(balance?.total_deposits)}</strong>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card">
            <div className="card-body text-center py-2">
              <small className="text-muted d-block">Withdrawals</small>
              <strong className="text-danger">{formatCurrency(balance?.total_withdrawals)}</strong>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card">
            <div className="card-body text-center py-2">
              <small className="text-muted d-block">Released</small>
              <strong className="text-warning">{formatCurrency(balance?.total_loans_released)}</strong>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card">
            <div className="card-body text-center py-2">
              <small className="text-muted d-block">Received</small>
              <strong className="text-info">{formatCurrency(balance?.total_payments_received)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <span>Transactions</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '140px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="loan_release">Loan Releases</option>
            <option value="payment_received">Payments</option>
          </select>
        </div>
        <div className="card-body p-0">
          {/* Desktop Table */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const info = getTypeInfo(tx.type);
                  const isPositive = ['deposit', 'payment_received'].includes(tx.type);
                  return (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.created_at)}</td>
                      <td>
                        <span className={`badge bg-${info.color}`}>
                          <i className={`bi ${info.icon} me-1`}></i>
                          {info.text}
                        </span>
                      </td>
                      <td className={`fw-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td>{formatCurrency(tx.balance_after)}</td>
                      <td className="text-muted">{tx.description || '-'}</td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No transactions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="d-md-none p-3">
            {transactions.map((tx) => {
              const info = getTypeInfo(tx.type);
              const isPositive = ['deposit', 'payment_received'].includes(tx.type);
              return (
                <div key={tx.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <span className={`badge bg-${info.color}`}>
                      <i className={`bi ${info.icon} me-1`}></i>
                      {info.text}
                    </span>
                    <strong className={isPositive ? 'text-success' : 'text-danger'}>
                      {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                    </strong>
                  </div>
                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Date</span>
                      <span>{formatDate(tx.created_at)}</span>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Balance After</span>
                      <strong>{formatCurrency(tx.balance_after)}</strong>
                    </div>
                    {tx.description && (
                      <small className="text-muted d-block mt-1">{tx.description}</small>
                    )}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="text-center py-4 text-muted">No transactions</div>
            )}
          </div>
        </div>

        {pagination.last_page > 1 && (
          <div className="card-footer">
            <ul className="pagination pagination-sm justify-content-center mb-0 flex-wrap gap-1">
              {[...Array(pagination.last_page)].map((_, i) => (
                <li key={i} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => fetchData(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === 'deposit' ? (
                    <><i className="bi bi-plus-circle text-success me-2"></i>Add Capital</>
                  ) : (
                    <><i className="bi bi-dash-circle text-danger me-2"></i>Withdraw</>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {modalType === 'withdraw' && (
                    <div className="alert alert-info py-2 mb-3">
                      Available: <strong>{formatCurrency(balance?.current_balance)}</strong>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Amount *</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      min="1"
                      max={modalType === 'withdraw' ? balance?.current_balance : undefined}
                      step="0.01"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional note"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-${modalType === 'deposit' ? 'success' : 'danger'}`}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : modalType === 'deposit' ? 'Add Capital' : 'Withdraw'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Capital;
