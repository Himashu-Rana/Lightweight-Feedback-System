import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import CreateFeedback from './pages/CreateFeedback';
import EmployeeList from './pages/EmployeeList';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import FeedbackRequests from './pages/FeedbackRequests';

const App = () => {
  const { isAuthenticated, user } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="feedback">
            {/* Nested routes for feedback */}
            <Route index element={<FeedbackList />} />
            <Route 
              path="create/:employeeId" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <CreateFeedback />
                </ProtectedRoute>
              } 
            />
            <Route path=":id" element={<FeedbackDetail />} />
          </Route>
          <Route 
            path="employees" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <EmployeeList />
              </ProtectedRoute>
            } 
          />
          <Route path="profile" element={<Profile />} />
          <Route path="requests" element={<FeedbackRequests />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Container>
  );
};

export default App;
