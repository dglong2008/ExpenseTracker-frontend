import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard'; // NEW: Import the Dashboard

// A helper component to protect routes that require authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // Avoid flashing the login page while checking for a token

  // If a user exists, render the child component (Dashboard). Otherwise, kick them to login.
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route: Redirects any unknown URLs to the dashboard (which handles auth checking) */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}