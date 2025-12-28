import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

/**
 * Login Page for Food Delivery System
 */
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call DOSWALLET User Service for login
      const response = await fetch('http://localhost:5001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
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
              email: email,
              password: password
            }
          }
        })
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0]?.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (result.data.login.token) {
        // Store token and user info
        localStorage.setItem('fds_token', result.data.login.token);
        localStorage.setItem('fds_userId', result.data.login.user.userId.toString());
        localStorage.setItem('fds_nim', result.data.login.user.email);
        localStorage.setItem('fds_user', JSON.stringify(result.data.login.user));

        // Navigate to checkout
        navigate('/checkout');
      } else {
        setError(result.data.login.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check if backend services are running.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Food Delivery System</h1>
        <h2>Login</h2>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>

        <div className="info-box">
          <p><strong>Note:</strong> Register di sini akan langsung membuat akun di DOSWALLET.</p>
          <p>Data langsung ter-record di database dan bisa langsung digunakan untuk payment.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

