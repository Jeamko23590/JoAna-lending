import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { admin, changePassword } = useAuth();
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.new_password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(
        passwords.current_password,
        passwords.new_password,
        passwords.new_password_confirmation
      );
      toast.success('Password changed');
      setPasswords({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="page-title">Settings</h4>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          {/* Account Info */}
          <div className="card mb-3">
            <div className="card-header">
              <i className="bi bi-person-circle me-2"></i>
              Account
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label text-muted small">Name</label>
                <p className="mb-0 fw-bold">{admin?.name}</p>
              </div>
              <div>
                <label className="form-label text-muted small">Email</label>
                <p className="mb-0 fw-bold">{admin?.email}</p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-key me-2"></i>
              Change Password
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="current_password"
                    value={passwords.current_password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="new_password"
                    value={passwords.new_password}
                    onChange={handleChange}
                    minLength="8"
                    required
                  />
                  <small className="text-muted">Minimum 8 characters</small>
                </div>

                <div className="mb-4">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="new_password_confirmation"
                    value={passwords.new_password_confirmation}
                    onChange={handleChange}
                    minLength="8"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          {/* System Info */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-info-circle me-2"></i>
              System Info
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Application</span>
                <strong>JoAna Lending</strong>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Version</span>
                <strong>1.0.0</strong>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Frontend</span>
                <strong>React + Vite</strong>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted">Backend</span>
                <strong>Laravel 10</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
