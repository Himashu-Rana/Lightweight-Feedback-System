import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SearchIcon from '@mui/icons-material/Search';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EmployeeList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await api.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError(err.message || 'Failed to load employees data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateFeedback = (employeeId) => {
    navigate(`/feedback/create/${employeeId}`);
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
      <Typography variant="h4" component="h1" gutterBottom>
        Team Members
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Search employees"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {filteredEmployees.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? 'No employees found matching your search.' : 'You have no team members assigned yet.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredEmployees.map(employee => (
            <Grid item xs={12} sm={6} md={4} key={employee.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {employee.full_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {employee.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    startIcon={<FeedbackIcon />}
                    onClick={() => handleCreateFeedback(employee.id)}
                    fullWidth
                  >
                    Give Feedback
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EmployeeList;
