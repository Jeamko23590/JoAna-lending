import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [capital, setCapital] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recent, setRecent] = useState({ recent_loans: [], recent_payments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartRes, recentRes, capitalRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/dashboard/chart'),
        api.get('/dashboard/recent'),
        api.get('/capital/balance'),
      ]);

      setStats(statsRes.data);
      setRecent(recentRes.data);
      setCapital(capitalRes.data);

      const labels = chartRes.data.map((d) => d.month);
      setChartData({
        labels,
        datasets: [
          {
            label: 'Collections',
            data: chartRes.data.map((d) => d.collections),
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.3,
          },
          {
            label: 'Releases',
            data: chartRes.data.map((d) => d.releases),
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            tension: 0.3,
          },
        ],
      });
    } catch (error) {
      console.error('Dashboard error:', error);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Available Capital', value: formatCurrency(capital?.current_balance), icon: 'bi-wallet2', color: 'info', link: '/capital' },
    { label: 'Active Loans', value: stats?.total_active_loans, icon: 'bi-cash-stack', color: 'primary' },
    { label: 'Collections', value: formatCurrency(stats?.total_collections), icon: 'bi-graph-up', color: 'success' },
    { label: 'Outstanding', value: formatCurrency(stats?.outstanding_balance), icon: 'bi-hourglass-split', color: 'warning' },
    { label: 'Overdue', value: stats?.overdue_loans_count, icon: 'bi-exclamation-triangle', color: 'danger' },
    { label: 'Borrowers', value: stats?.active_borrowers, icon: 'bi-people', color: 'secondary' },
  ];

  return (
    <div>
      <h4 className="page-title">Dashboard</h4>

      {/* Stat Cards */}
      <div className="row g-2 g-md-3 mb-4">
        {statCards.map((card, index) => (
          <div className="col-6 col-lg-4" key={index}>
            {card.link ? (
              <Link to={card.link} className="text-decoration-none">
                <div className={`card stat-card ${card.color} h-100`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div style={{minWidth: 0}}>
                        <div className="text-muted small text-uppercase text-truncate">{card.label}</div>
                        <div className="h4 mb-0 mt-1 text-truncate">{card.value}</div>
                      </div>
                      <i className={`bi ${card.icon} stat-icon d-none d-sm-block`}></i>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className={`card stat-card ${card.color} h-100`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div style={{minWidth: 0}}>
                      <div className="text-muted small text-uppercase text-truncate">{card.label}</div>
                      <div className="h4 mb-0 mt-1 text-truncate">{card.value}</div>
                    </div>
                    <i className={`bi ${card.icon} stat-icon d-none d-sm-block`}></i>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Chart */}
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">Monthly Summary</div>
            <div className="card-body">
              {chartData && (
                <div className="chart-container" style={{height: '300px'}}>
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Loans */}
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header">Recent Loans</div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {recent.recent_loans.slice(0, 5).map((loan) => (
                  <li className="list-group-item d-flex justify-content-between align-items-center py-2 px-3" key={loan.id}>
                    <div style={{minWidth: 0}}>
                      <div className="fw-bold text-truncate">{loan.borrower?.full_name}</div>
                      <small className="text-muted">{formatCurrency(loan.loan_amount)}</small>
                    </div>
                    <span className={`badge bg-${loan.status === 'ongoing' ? 'primary' : loan.status === 'fully_paid' ? 'success' : 'danger'}`}>
                      {loan.status.replace('_', ' ')}
                    </span>
                  </li>
                ))}
                {recent.recent_loans.length === 0 && (
                  <li className="list-group-item text-center text-muted py-3">No recent loans</li>
                )}
              </ul>
            </div>
            <div className="card-footer text-center py-2">
              <Link to="/loans" className="text-decoration-none small">View All Loans</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
