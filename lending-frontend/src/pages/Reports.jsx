import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [selectedBorrower, setSelectedBorrower] = useState('');
  const [borrowers, setBorrowers] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      const response = await api.get('/borrowers/list');
      setBorrowers(response.data);
    } catch (error) {
      console.error('Failed to load borrowers');
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

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/daily-collections', { params: { date: dailyDate } });
      setReportData({ type: 'daily', ...response.data });
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/monthly-income', {
        params: { month: monthlyMonth, year: monthlyYear },
      });
      setReportData({ type: 'monthly', ...response.data });
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowerLedger = async () => {
    if (!selectedBorrower) {
      toast.warning('Select a borrower');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/reports/borrower-ledger/${selectedBorrower}`);
      setReportData({ type: 'ledger', ...response.data });
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/overdue');
      setReportData({ type: 'overdue', loans: response.data });
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await api.get('/reports/export/daily', {
        params: { date: dailyDate, format },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `collections-${dailyDate}.${format === 'pdf' ? 'pdf' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily', icon: 'bi-calendar-day' },
    { id: 'monthly', label: 'Monthly', icon: 'bi-calendar-month' },
    { id: 'ledger', label: 'Ledger', icon: 'bi-person-lines-fill' },
    { id: 'overdue', label: 'Overdue', icon: 'bi-exclamation-triangle' },
  ];

  return (
    <div>
      <h4 className="page-title">Reports</h4>

      <div className="card">
        <div className="card-header p-0">
          <ul className="nav nav-tabs card-header-tabs">
            {tabs.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setReportData(null);
                  }}
                >
                  <i className={`bi ${tab.icon} me-1`}></i>
                  <span className="d-none d-sm-inline">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">
          {/* Daily Tab */}
          {activeTab === 'daily' && (
            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-6 col-md-4">
                <input
                  type="date"
                  className="form-control"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-auto d-flex gap-2">
                <button className="btn btn-primary flex-fill" onClick={fetchDailyReport}>
                  Generate
                </button>
                <button className="btn btn-outline-danger" onClick={() => exportReport('pdf')}>
                  <i className="bi bi-file-pdf"></i>
                </button>
                <button className="btn btn-outline-success" onClick={() => exportReport('csv')}>
                  <i className="bi bi-file-excel"></i>
                </button>
              </div>
            </div>
          )}

          {/* Monthly Tab */}
          {activeTab === 'monthly' && (
            <div className="row g-2 mb-3">
              <div className="col-6 col-md-3">
                <select
                  className="form-select"
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <select
                  className="form-select"
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(e.target.value)}
                >
                  {[...Array(5)].map((_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-auto">
                <button className="btn btn-primary w-100" onClick={fetchMonthlyReport}>
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* Ledger Tab */}
          {activeTab === 'ledger' && (
            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-6 col-md-4">
                <select
                  className="form-select"
                  value={selectedBorrower}
                  onChange={(e) => setSelectedBorrower(e.target.value)}
                >
                  <option value="">Select Borrower</option>
                  {borrowers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-auto">
                <button className="btn btn-primary w-100" onClick={fetchBorrowerLedger}>
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* Overdue Tab */}
          {activeTab === 'overdue' && (
            <div className="mb-3">
              <button className="btn btn-primary" onClick={fetchOverdueReport}>
                Load Overdue Accounts
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          )}

          {/* Daily Report */}
          {!loading && reportData?.type === 'daily' && (
            <div>
              <h6 className="mb-3">Collections - {formatDate(reportData.date)}</h6>
              {reportData.payments?.length > 0 ? (
                <>
                  {reportData.payments.map((p) => (
                    <div key={p.id} className="mobile-card">
                      <div className="d-flex justify-content-between">
                        <span>{p.loan?.borrower?.full_name}</span>
                        <strong className="text-success">{formatCurrency(p.amount_paid)}</strong>
                      </div>
                    </div>
                  ))}
                  <div className="alert alert-success mt-3">
                    <strong>Total: {formatCurrency(reportData.total)}</strong>
                  </div>
                </>
              ) : (
                <p className="text-muted">No collections for this date</p>
              )}
            </div>
          )}

          {/* Monthly Report */}
          {!loading && reportData?.type === 'monthly' && (
            <div className="row g-3">
              <div className="col-6 col-md-4">
                <div className="card bg-success text-white">
                  <div className="card-body text-center py-3">
                    <small>Collections</small>
                    <h5 className="mb-0">{formatCurrency(reportData.total_collections)}</h5>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center py-3">
                    <small>Released</small>
                    <h5 className="mb-0">{formatCurrency(reportData.loans_released)}</h5>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card bg-warning">
                  <div className="card-body text-center py-3">
                    <small>Interest Earned</small>
                    <h5 className="mb-0">{formatCurrency(reportData.interest_earned)}</h5>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ledger Report */}
          {!loading && reportData?.type === 'ledger' && (
            <div>
              <h6 className="mb-3">{reportData.borrower?.full_name}</h6>
              {reportData.ledger?.map((item, i) => (
                <div key={i} className="card mb-3">
                  <div className="card-header d-flex justify-content-between py-2">
                    <span>Loan #{item.loan.id} - {formatCurrency(item.loan.loan_amount)}</span>
                    <span
                      className={`badge bg-${item.loan.status === 'ongoing' ? 'primary' : item.loan.status === 'fully_paid' ? 'success' : 'danger'}`}
                    >
                      {item.loan.status}
                    </span>
                  </div>
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between small">
                      <span>Paid: {formatCurrency(item.total_paid)}</span>
                      <span>Balance: {formatCurrency(item.remaining)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Overdue Report */}
          {!loading && reportData?.type === 'overdue' && (
            <div>
              {reportData.loans?.length > 0 ? (
                reportData.loans.map((loan) => (
                  <div key={loan.id} className="mobile-card border-danger">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>{loan.borrower?.full_name}</strong>
                      <span className="text-danger">{loan.days_overdue} days</span>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span>Balance: {formatCurrency(loan.remaining_balance)}</span>
                      <span>Due: {formatDate(loan.due_date)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No overdue accounts</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
