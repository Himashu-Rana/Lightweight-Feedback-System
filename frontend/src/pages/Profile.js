import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email
      };
      
      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await api.updateProfile(updateData);
      setSuccess(true);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  fontSize: '2.5rem',
                  bgcolor: 'primary.main'
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider>
                <Typography variant="caption" color="text.secondary">
                  Change Password (Optional)
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="New Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={4} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Role:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body2">
                {user?.role === 'manager' ? 'Manager' : 'Employee'}
              </Typography>
            </Grid>
            
            {user?.role === 'employee' && user?.manager && (
              <>
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Manager:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">
                    {user.manager.full_name}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Profile;
