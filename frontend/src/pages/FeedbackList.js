import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackCard from '../components/FeedbackCard';

const FeedbackList = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  
  const isManager = user?.role === 'manager';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch feedback data
        const feedbackData = await api.getFeedbacks();
        setFeedbacks(feedbackData);
        
        // If manager, fetch employees data
        if (isManager) {
          const employeesData = await api.getEmployees();
          setEmployees(employeesData);
        }
      } catch (err) {
        setError(err.message || 'Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isManager]);

  const handleAcknowledgeFeedback = async (feedbackId) => {
    try {
      await api.acknowledgeFeedback(feedbackId);
      
      // Update the feedback list
      const updatedFeedbacks = feedbacks.map(feedback => {
        if (feedback.id === feedbackId) {
          return { ...feedback, is_acknowledged: true };
        }
        return feedback;
      });
      
      setFeedbacks(updatedFeedbacks);
    } catch (err) {
      console.error('Failed to acknowledge feedback:', err);
    }
  };

  // Filter functions for tabs
  const getAcknowledgedFeedback = () => feedbacks.filter(f => f.is_acknowledged);
  const getPendingFeedback = () => feedbacks.filter(f => !f.is_acknowledged);

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.full_name : 'Unknown';
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isManager ? 'Feedback Given' : 'My Feedback'}
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="feedback tabs">
          <Tab label="All" />
          <Tab label="Acknowledged" />
          <Tab label="Pending" />
        </Tabs>
      </Box>
      
      {feedbacks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No feedback available.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {(tabValue === 0
            ? feedbacks
            : tabValue === 1
              ? getAcknowledgedFeedback()
              : getPendingFeedback()
          ).map(feedback => (
            <Grid item xs={12} md={6} lg={4} key={feedback.id}>
              <FeedbackCard 
                feedback={feedback}
                employeeName={isManager ? getEmployeeName(feedback.employee_id) : null}
                onAcknowledge={!isManager ? handleAcknowledgeFeedback : null}
              />
            </Grid>
          ))}
          
          {tabValue !== 0 && (
            tabValue === 1 && getAcknowledgedFeedback().length === 0 || 
            tabValue === 2 && getPendingFeedback().length === 0
          ) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  No {tabValue === 1 ? 'acknowledged' : 'pending'} feedback.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default FeedbackList;
