import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { loginUser } from '../api/authApi';
import '../components/AuthForm.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser(formData);

      // Store authentication state.
      // (Just localStorage for now — no dashboard/protected frontend routes yet,
      // this only satisfies "store authentication state" from the current scope.)
      localStorage.setItem('cloudvault_token', response.data.token);
      localStorage.setItem('cloudvault_user', JSON.stringify(response.data.user));

      // No dashboard exists yet in this scope, so just confirm success for now.
    //   alert(`Welcome back, ${response.data.user.name}!`);

      navigate('/dashboard');

    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="auth-form-title">Welcome back</h2>
      <p className="auth-form-subtitle">Log in to access your CloudVault account.</p>

      {serverError && <div className="auth-form-banner-error">{serverError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`auth-form-input ${fieldErrors.email ? 'has-error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {fieldErrors.email && <p className="auth-form-error-text">{fieldErrors.email}</p>}
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className={`auth-form-input ${fieldErrors.password ? 'has-error' : ''}`}
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          {fieldErrors.password && <p className="auth-form-error-text">{fieldErrors.password}</p>}
        </div>

        <button type="submit" className="auth-form-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth-form-footer">
        Don't have an account? <Link to="/register">Create account</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;