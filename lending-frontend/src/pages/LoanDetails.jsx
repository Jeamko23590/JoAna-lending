import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const LoanDetails = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLoan();
  }, [id]);

  const fetchLoan = async () => {
    try {
      const response = await api.get(`/loans/${id}`);
      setLoan(response.data);
    } catch (error) {
      toast.error('Failed to load loan');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/payments', { loan_id: id, ...paymentData });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      setPaymentData({
        payment_date: new Date().toISOString().split('T')[0],
        amount_paid: '',
        remarks: '',
      });
      fetchLoan();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const printReceipt = async (paymentId) => {
    try {
      const response = await api.get(`/reports/receipt/${paymentId}`, { responseType: 'blob' });
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!loan) {
    return <div className="alert alert-danger">Loan not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = { ongoing: 'primary', fully_paid: 'success', overdue: 'danger' };
    return colors[status] || 'secondary';
  };

  const paidPeriods = loan.payments?.length || 0;
  const totalPeriods = loan.loan_term;

  return (
    <div>
      <div className="page-header">
        <h4 className="page-title">Loan Details</h4>
        <div className="page-header-actions">
          {loan.status !== 'fully_paid' && (
            <button className="btn btn-success" onClick={() => setShowPaymentModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Pay
            </button>
          )}
          <Link to={`/loans/${id}/edit`} className="btn btn-outline-primary">
            <i className="bi bi-pencil"></i>
          </Link>
          <Link to="/loans" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left"></i>
          </Link>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Column */}
        <div className="col-12 col-lg-4">
          {/* Borrower Card */}
          <div className="card mb-3">
            <div className="card-header">Borrower</div>
            <div className="card-body">
              <h5 className="mb-2">{loan.borrower?.full_name}</h5>
              <p className="small mb-1">
                <i className="bi bi-telephone me-2 text-muted"></i>
                {loan.borrower?.contact_number}
              </p>
              <p className="small mb-0 text-truncate-2">
                <i className="bi bi-geo-alt me-2 text-muted"></i>
                {loan.borrower?.address}
              </p>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Summary</span>
              <span className={`badge bg-${getStatusColor(loan.status)}`}>
                {loan.status.replace('_', ' ')}
              </span>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Principal</span>
                <strong>{formatCurrency(loan.loan_amount)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Interest</span>
                <strong className="text-warning">{formatCurrency(loan.total_interest)}</strong>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Total Payable</span>
                <strong className="text-primary">{formatCurrency(loan.total_payable)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Paid</span>
                <strong className="text-success">{formatCurrency(loan.total_payable - loan.remaining_balance)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Balance</span>
                <strong className="text-danger">{formatCurrency(loan.remaining_balance)}</strong>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Schedule</span>
              <button className="btn btn-sm btn-link p-0" onClick={() => setShowSchedule(!showSchedule)}>
                {showSchedule ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="card-body">
              <div className="alert alert-info py-2 mb-2">
                <div className="d-flex justify-content-between">
                  <span>Per {
                    loan.term_type === 'daily' ? 'Day' :
                    loan.term_type === 'semi_monthly' ? 'Period' :
                    loan.term_type === 'weeks' ? 'Week' : 'Month'
                  }</span>
                  <strong>{formatCurrency(loan.payment_per_period)}</strong>
                </div>
              </div>
              <div className="small">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Progress</span>
                  <span>{paidPeriods} / {totalPeriods} payments</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Due Date</span>
                  <span>{formatDate(loan.due_date)}</span>
                </div>
              </div>

              {showSchedule && loan.payment_schedule && (
                <div className="mt-3 border-top pt-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {loan.payment_schedule.map((item, idx) => {
                    const isPaid = idx < paidPeriods;
                    const isNext = idx === paidPeriods;
                    return (
                      <div
                        key={idx}
                        className={`d-flex justify-content-between align-items-center small py-1 ${isPaid ? 'text-muted' : ''} ${isNext ? 'fw-bold text-primary' : ''}`}
                      >
                        <span style={{ textDecoration: isPaid ? 'line-through' : 'none' }}>
                          {loan.term_type === 'daily' ? 'D' : loan.term_type === 'semi_monthly' ? 'S' : loan.term_type === 'weeks' ? 'W' : 'M'}{item.period}
                        </span>
                        <span style={{ textDecoration: isPaid ? 'line-through' : 'none' }}>
                          {formatDate(item.due_date)}
                        </span>
                        <span>{formatCurrency(item.amount)}</span>
                        {isPaid && <i className="bi bi-check-circle-fill text-success"></i>}
                        {isNext && <i className="bi bi-arrow-left text-primary"></i>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Payment History */}
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Payment History</span>
              <span className="badge bg-secondary">{loan.payments?.length || 0}</span>
            </div>
            <div className="card-body p-0">
              {/* Desktop Table */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th style={{width: '60px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.payments?.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.payment_date)}</td>
                        <td className="fw-bold text-success">{formatCurrency(payment.amount_paid)}</td>
                        <td>{formatCurrency(payment.balance_after)}</td>
                        <td>
                          <span className={`badge bg-${payment.is_late ? 'warning' : 'success'}`}>
                            {payment.is_late ? 'Late' : 'On Time'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => printReceipt(payment.id)}
                          >
                            <i className="bi bi-printer"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!loan.payments || loan.payments.length === 0) && (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No payments yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none p-3">
                {loan.payments?.map((payment) => (
                  <div key={payment.id} className="mobile-card">
                    <div className="mobile-card-header">
                      <div>
                        <strong className="text-success">{formatCurrency(payment.amount_paid)}</strong>
                        <small className="text-muted d-block">{formatDate(payment.payment_date)}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge bg-${payment.is_late ? 'warning' : 'success'}`}>
                          {payment.is_late ? 'Late' : 'On Time'}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => printReceipt(payment.id)}
                        >
                          <i className="bi bi-printer"></i>
                        </button>
                      </div>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Balance After</span>
                      <strong>{formatCurrency(payment.balance_after)}</strong>
                    </div>
                  </div>
                ))}
                {(!loan.payments || loan.payments.length === 0) && (
                  <div className="text-center py-4 text-muted">No payments yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <form onSubmit={handlePaymentSubmit}>
                <div className="modal-body">
                  <div className="alert alert-info py-2 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Suggested: <strong>{formatCurrency(loan.payment_per_period)}</strong></span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setPaymentData({ ...paymentData, amount_paid: loan.payment_per_period })}
                      >
                        Use
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={paymentData.payment_date}
                      onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={paymentData.amount_paid}
                      onChange={(e) => setPaymentData({ ...paymentData, amount_paid: e.target.value })}
                      min="0.01"
                      max={loan.remaining_balance}
                      step="0.01"
                      required
                    />
                    <small className="text-muted">Balance: {formatCurrency(loan.remaining_balance)}</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Remarks</label>
                    <input
                      type="text"
                      className="form-control"
                      value={paymentData.remarks}
                      onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save'}
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

export default LoanDetails;
