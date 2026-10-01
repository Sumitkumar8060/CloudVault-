import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { registerUser } from '../api/authApi';
import '../components/AuthForm.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match.';
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
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

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
      <h2 className="auth-form-title">Create your account</h2>
      <p className="auth-form-subtitle">Start securing your documents with CloudVault.</p>

      {serverError && <div className="auth-form-banner-error">{serverError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className={`auth-form-input ${fieldErrors.name ? 'has-error' : ''}`}
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
          />
          {fieldErrors.name && <p className="auth-form-error-text">{fieldErrors.name}</p>}
        </div>

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
            autoComplete="new-password"
          />
          {fieldErrors.password && <p className="auth-form-error-text">{fieldErrors.password}</p>}
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label" htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className={`auth-form-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <p className="auth-form-error-text">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="auth-form-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-form-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;