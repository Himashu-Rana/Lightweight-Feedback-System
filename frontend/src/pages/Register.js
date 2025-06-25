import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Grid,
  Alert,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    manager_id: ''
  });
  
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
    // Fetch managers when the component loads
  useEffect(() => {
    const fetchManagers = async () => {
      if (formData.role === 'employee') {
        setLoadingManagers(true);
        try {
          const data = await api.getManagers();
          setManagers(data);
        } catch (err) {
          console.error('Failed to fetch managers:', err);
        } finally {
          setLoadingManagers(false);
        }
      }
    };
    
    fetchManagers();
  }, [formData.role]);
  
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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // Validate manager selection for employees
    if (formData.role === 'employee' && !formData.manager_id && managers.length > 0) {
      setError('Please select a manager');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Register user with appropriate data
      const userData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      // Only add manager_id for employees
      if (formData.role === 'employee' && formData.manager_id) {
        userData.manager_id = formData.manager_id;
      }
      
      await register(userData);
      
      // Redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5" gutterBottom>
              Feedback System
            </Typography>
            <Typography component="h2" variant="h6">
              Create an Account
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="full_name"
                label="Full Name"
                name="full_name"
                autoComplete="name"
                autoFocus
                value={formData.full_name}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirm-password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={formData.role}
                  label="Role"
                  name="role"
                  onChange={handleChange}
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
              
              {formData.role === 'employee' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="manager-label">Select Your Manager</InputLabel>
                  <Select
                    labelId="manager-label"
                    id="manager_id"
                    value={formData.manager_id}
                    label="Select Your Manager"
                    name="manager_id"
                    onChange={handleChange}
                    disabled={loadingManagers}
                  >
                    {loadingManagers ? (
                      <MenuItem value="">
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      managers.map(manager => (
                        <MenuItem key={manager.id} value={manager.id}>
                          {manager.full_name} ({manager.email})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
