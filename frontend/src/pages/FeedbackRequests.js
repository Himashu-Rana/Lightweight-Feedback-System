import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const FeedbackRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isManager = user?.role === 'manager';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch requests
        const requestsData = await api.getFeedbackRequests();
        setRequests(requestsData);
        
        // If manager, get employee names
        if (isManager && requestsData.length > 0) {
          const employeeIds = [...new Set(requestsData.map(r => r.employee_id))];
          const employeeData = {};
          
          for (const empId of employeeIds) {
            const employee = await api.get(`/api/users/${empId}`);
            employeeData[empId] = employee;
          }
          
          setEmployees(employeeData);
        }
      } catch (err) {
        setError(err.message || 'Failed to load feedback requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isManager]);
  
  const handleCreateFeedback = (employeeId, requestId) => {
    navigate(`/feedback/create/${employeeId}?requestId=${requestId}`);
  };
  
  const handleCreateRequest = async () => {
    try {
      const newRequest = await api.createFeedbackRequest();
      setRequests([newRequest, ...requests]);
    } catch (err) {
      setError(err.message || 'Failed to create feedback request');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Feedback Requests
        </Typography>
        
        {!isManager && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateRequest}
          >
            Request Feedback
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {requests.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No feedback requests available.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <List>
            {requests.map((request, index) => (
              <React.Fragment key={request.id}>
                <ListItem
                  sx={{
                    py: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {isManager 
                            ? `Request from ${employees[request.employee_id]?.full_name || 'Employee'}`
                            : 'Feedback Request'}
                        </Typography>
                        <Chip
                          label={request.status === 'completed' ? 'Completed' : 'Pending'}
                          color={request.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                    secondary={`Requested on ${formatDate(request.created_at)}`}
                    sx={{ mb: { xs: 1, sm: 0 } }}
                  />
                  
                  {isManager && request.status === 'pending' && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleCreateFeedback(request.employee_id, request.id)}
                    >
                      Provide Feedback
                    </Button>
                  )}
                </ListItem>
                {index < requests.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default FeedbackRequests;
