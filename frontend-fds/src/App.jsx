import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import './App.css';

function App() {
  // Check if user is logged in
  const token = localStorage.getItem('fds_token');
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/checkout" 
            element={token ? <Checkout /> : <Navigate to="/login" />} 
          />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/" element={<Navigate to={token ? "/checkout" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

