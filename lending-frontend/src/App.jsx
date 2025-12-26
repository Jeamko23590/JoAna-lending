import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Borrowers from './pages/Borrowers';
import BorrowerForm from './pages/BorrowerForm';
import Loans from './pages/Loans';
import LoanForm from './pages/LoanForm';
import LoanDetails from './pages/LoanDetails';
import Payments from './pages/Payments';
import Capital from './pages/Capital';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="borrowers" element={<Borrowers />} />
            <Route path="borrowers/new" element={<BorrowerForm />} />
            <Route path="borrowers/:id/edit" element={<BorrowerForm />} />
            <Route path="loans" element={<Loans />} />
            <Route path="loans/new" element={<LoanForm />} />
            <Route path="loans/:id" element={<LoanDetails />} />
            <Route path="loans/:id/edit" element={<LoanForm />} />
            <Route path="payments" element={<Payments />} />
            <Route path="capital" element={<Capital />} />
            <Route path="reports" element={<Reports />} />1
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
