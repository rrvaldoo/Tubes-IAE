import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

/**
 * Register Page for Food Delivery System
 */
function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Call DOSWALLET User Service for registration
      const response = await fetch('http://localhost:5001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user {
                  userId
                  name
                  email
                  phone
                }
                message
              }
            }
          `,
          variables: {
            input: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              password: formData.password
            }
          }
        })
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0]?.message || 'Registration failed');
        setLoading(false);
        return;
      }

      if (result.data.register.token) {
        setSuccess('Registration successful! Redirecting...');
        
        // Store token and user info
        localStorage.setItem('fds_token', result.data.register.token);
        localStorage.setItem('fds_userId', result.data.register.user.userId.toString());
        localStorage.setItem('fds_nim', result.data.register.user.email);
        localStorage.setItem('fds_user', JSON.stringify(result.data.register.user));

        // Navigate to checkout after 1 second
        setTimeout(() => {
          navigate('/checkout');
        }, 1000);
      } else {
        setError(result.data.register.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please check if backend services are running.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Food Delivery System</h1>
        <h2>Register</h2>
        
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password (min 6 characters)"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>

        <div className="info-box">
          <p><strong>Note:</strong> Registrasi di sini akan langsung membuat akun di DOSWALLET.</p>
          <p>Data langsung ter-record di database melalui User Service DOSWALLET.</p>
          <p>Setelah registrasi, Anda bisa top up wallet untuk melakukan pembayaran.</p>
        </div>
      </div>
    </div>
  );
}

export default Register;

