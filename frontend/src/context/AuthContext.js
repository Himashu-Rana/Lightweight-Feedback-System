import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists in localStorage on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log('Found token in localStorage, verifying...');
          api.setToken(token);
          const response = await api.get('/api/users/me/');
          console.log('Token valid, user authenticated:', response);
          setUser(response);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Authentication error on startup:', err);
          console.log('Clearing invalid token and logging out');
          logout();
        }
      } else {
        console.log('No authentication token found');
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login with:', { email });
      
      // First, clear any existing tokens to avoid conflicts
      localStorage.removeItem('token');
      api.setToken(null);
      
      const data = await api.login(email, password);
      
      if (data && data.access_token) {
        console.log('Login successful, token received');
        
        // Save the token
        localStorage.setItem('token', data.access_token);
        api.setToken(data.access_token);
        
        try {
          // Get user data
          console.log('Fetching user data...');
          const userData = await api.get('/api/users/me/');
          console.log('User data received:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          
          // Check if it's an authorization error
          const isAuthError = userError.message && 
            (userError.message.includes('credentials') || 
             userError.message.includes('token') ||
             userError.message.includes('unauthorized') ||
             userError.message.includes('401'));
             
          if (isAuthError) {
            setError('Authentication failed. Please try again with correct credentials.');
          } else {
            setError('Authentication successful but failed to fetch user data. Please try again.');
          }
          
          logout(); // Clear the invalid authentication
          return false;
        }
      } else {
        console.error('No access token in response:', data);
        setError('Invalid response from server. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials and try again.');
      return false;
    }
  };
  const register = async (userData) => {
    try {
      setError(null);
      console.log("Register method called with data:", userData);
      
      // Using the enhanced register method from api.js
      const data = await api.register(userData);
      console.log("Registration successful:", data);
      return data;
    } catch (err) {
      console.error("Registration error in AuthContext:", err);
      setError(err.detail || err.message || 'Failed to register. Please check your connection and try again.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
