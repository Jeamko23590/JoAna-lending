import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const LoanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [borrowers, setBorrowers] = useState([]);
  const [formData, setFormData] = useState({
    borrower_id: '',
    loan_amount: '',
    interest_amount: '',
    loan_term: '',
    term_type: 'months',
    release_date: new Date().toISOString().split('T')[0],
    status: 'ongoing',
  });
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchBorrowers();
    if (isEdit) fetchLoan();
    else setFetching(false);
  }, [id]);

  const fetchBorrowers = async () => {
    try {
      const response = await api.get('/borrowers/list');
      setBorrowers(response.data);
    } catch (error) {
      toast.error('Failed to load borrowers');
    }
  };

  const fetchLoan = async () => {
    try {
      const response = await api.get(`/loans/${id}`);
      const loan = response.data;
      setFormData({
        borrower_id: loan.borrower_id,
        loan_amount: loan.loan_amount,
        interest_amount: loan.interest_amount,
        loan_term: loan.loan_term,
        term_type: loan.term_type,
        release_date: loan.release_date.split('T')[0],
        status: loan.status,
      });
      setCalculation({
        total_interest: loan.total_interest,
        total_payable: loan.total_payable,
        payment_per_period: loan.payment_per_period,
        due_date: loan.due_date,
      });
    } catch (error) {
      toast.error('Failed to load loan');
      navigate('/loans');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateLoan = async () => {
    if (!formData.loan_amount || !formData.loan_term) return;

    try {
      const response = await api.post('/loans/calculate', {
        ...formData,
        interest_amount: formData.interest_amount || 0,
      });
      setCalculation(response.data);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(calculateLoan, 500);
    return () => clearTimeout(timer);
  }, [formData.loan_amount, formData.interest_amount, formData.loan_term, formData.term_type, formData.release_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData, interest_amount: formData.interest_amount || 0 };

      if (isEdit) {
        await api.put(`/loans/${id}`, payload);
        toast.success('Loan updated');
      } else {
        await api.post('/loans', payload);
        toast.success('Loan created');
      }
      navigate('/loans');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save loan');
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
        <h4 className="page-title">{isEdit ? 'Edit Loan' : 'New Loan'}</h4>
        <div className="page-header-actions">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/loans')}>
            Cancel
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Form */}
        <div className="col-12 col-lg-7">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Borrower *</label>
                  <select
                    className="form-select"
                    name="borrower_id"
                    value={formData.borrower_id}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                  >
                    <option value="">Select Borrower</option>
                    {borrowers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label">Principal *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="loan_amount"
                      value={formData.loan_amount}
                      onChange={handleChange}
                      min="1"
                      placeholder="10000"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Total Interest</label>
                    <input
                      type="number"
                      className="form-control"
                      name="interest_amount"
                      value={formData.interest_amount}
                      onChange={handleChange}
                      min="0"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-6">
                    <label className="form-label">Payments *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="loan_term"
                      value={formData.loan_term}
                      onChange={handleChange}
                      min="1"
                      placeholder="6"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Frequency *</label>
                    <select className="form-select" name="term_type" value={formData.term_type} onChange={handleChange}>
                      <option value="daily">Daily</option>
                      <option value="semi_monthly">Semi-Monthly (15th & End)</option>
                      <option value="weeks">Weekly</option>
                      <option value="months">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-6">
                    <label className="form-label">Release Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="release_date"
                      value={formData.release_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {isEdit && (
                    <div className="col-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                        <option value="ongoing">Ongoing</option>
                        <option value="fully_paid">Fully Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        {isEdit ? 'Update Loan' : 'Create Loan'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="col-12 col-lg-5">
          <div className="card bg-light">
            <div className="card-header">Loan Summary</div>
            <div className="card-body">
              {calculation ? (
                <>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Principal</small>
                      <strong>{formatCurrency(formData.loan_amount)}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Interest</small>
                      <strong className="text-warning">{formatCurrency(calculation.total_interest)}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Total Payable</small>
                      <strong className="text-primary fs-5">{formatCurrency(calculation.total_payable)}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Due Date</small>
                      <strong>{formatDate(calculation.due_date)}</strong>
                    </div>
                  </div>

                  <div className="alert alert-info py-2 mb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Per {
                        formData.term_type === 'daily' ? 'Day' :
                        formData.term_type === 'semi_monthly' ? 'Period' :
                        formData.term_type === 'weeks' ? 'Week' : 'Month'
                      }</span>
                      <strong className="fs-5">{formatCurrency(calculation.payment_per_period)}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">Enter loan details to see calculation</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanForm;
