import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/borrowers', icon: 'bi-people', label: 'Borrowers' },
    { path: '/loans', icon: 'bi-cash-stack', label: 'Loans' },
    { path: '/payments', icon: 'bi-credit-card', label: 'Payments' },
    { path: '/capital', icon: 'bi-wallet2', label: 'Capital' },
    { path: '/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
    { path: '/settings', icon: 'bi-gear', label: 'Settings' },
  ];

  return (
    <div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <nav className={`sidebar d-flex flex-column ${sidebarOpen ? 'show' : ''}`}>
        <div className="p-3 text-white border-bottom border-light border-opacity-25">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-bank me-2"></i>
              JoAna Lending
            </h5>
            <button 
              className="btn btn-link text-white d-md-none p-0"
              onClick={closeSidebar}
            >
              <i className="bi bi-x-lg fs-5"></i>
            </button>
          </div>
        </div>
        
        <ul className="nav flex-column flex-grow-1 py-2">
          {navItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
                onClick={closeSidebar}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="p-3 border-top border-light border-opacity-25">
          <div className="text-white-50 small mb-2">
            <i className="bi bi-person-circle me-1"></i>
            {admin?.name}
          </div>
          <button 
            className="btn btn-outline-light btn-sm w-100"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-1"></i>
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        {/* Mobile header */}
        <div className="mobile-header d-md-none">
          <button 
            className="btn btn-link text-primary p-0"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list fs-4"></i>
          </button>
          <span className="fw-bold">JoAna Lending</span>
        </div>
        
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
