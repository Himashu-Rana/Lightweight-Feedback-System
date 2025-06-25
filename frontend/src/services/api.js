import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Initialize the token on module load
const initializeToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token initialized from localStorage:', token);
  }
};

// Run the initialization
initializeToken();

const api = {
  // Token management
  setToken: (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in headers:', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Token removed from headers');
    }
  },
  
  // Authentication
  login: async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const { data } = await axios.post(`${API_URL}/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return data;
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      throw handleError(error);
    }
  },
  // Generic API methods
  get: async (endpoint) => {
    try {
      const { data } = await axios.get(`${API_URL}${endpoint}`);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  },
  
  post: async (endpoint, payload) => {
    try {
      const { data } = await axios.post(`${API_URL}${endpoint}`, payload);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  },
  
  put: async (endpoint, payload) => {
    try {
      const { data } = await axios.put(`${API_URL}${endpoint}`, payload);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  },
  
  delete: async (endpoint) => {
    try {
      const { data } = await axios.delete(`${API_URL}${endpoint}`);
      return data;
    } catch (error) {
      throw handleError(error);
    }
  },
  
  // User specific methods  getProfile: () => api.get('/api/users/me/'),
  updateProfile: (profileData) => api.put('/api/users/me/', profileData),
  
  // Authentication methods with better error handling
  register: async (userData) => {
    try {
      console.log("Registering user:", userData);
      const response = await axios.post(`${API_URL}/api/users/`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log("Registration successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error.response ? error.response.data : error.message);
      throw error.response ? error.response.data : new Error(error.message);
    }
  },
  
  // Feedback methods
  getFeedbacks: () => api.get('/api/feedback/'),
  getFeedback: async (id) => {
    try {
      console.log('Fetching feedback with ID:', id);
      const response = await axios.get(`${API_URL}/api/feedback/${id}`);
      console.log('Feedback detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback detail:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      throw handleError(error);
    }
  },
  createFeedback: async (feedbackData) => {
    try {
      console.log('Creating feedback with data:', feedbackData);
      console.log('API URL:', API_URL);
      console.log('Current headers:', axios.defaults.headers.common);
      
      // Ensure we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('You must be logged in to submit feedback');
      }
      
      // Explicitly set the token for this request
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      console.log('Using request headers:', headers);
      
      const response = await axios.post(`${API_URL}/api/feedback/`, feedbackData, { headers });
      console.log('Feedback created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Feedback creation error:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received. Request details:', {
          method: 'POST',
          url: `${API_URL}/api/feedback/`,
          data: feedbackData,
        });
        console.error('Request object:', error.request);
        
        // Check browser network connectivity
        console.log('Network online status:', navigator.onLine);
        
        // Try a basic fetch to test connectivity
        fetch(API_URL)
          .then(res => console.log('Basic connectivity test succeeded:', res.status))
          .catch(err => console.error('Basic connectivity test failed:', err));
      } else {
        console.error('Error message:', error.message);
      }
      throw handleError(error);
    }
  },
  updateFeedback: (id, feedbackData) => api.put(`/api/feedback/${id}`, feedbackData),
  acknowledgeFeedback: (id) => api.put(`/api/feedback/${id}/acknowledge`, {}),
  commentOnFeedback: (id, comment) => api.post(`/api/feedback/${id}/comments/`, { comment }),
    // Manager specific methods
  getEmployees: () => api.get('/api/users/'),
  getManagers: () => api.get('/api/managers/'),
    // Dashboard methods
  getManagerDashboard: async () => {
    try {
      console.log('Fetching manager dashboard data');
      const response = await axios.get(`${API_URL}/api/dashboard/manager`);
      console.log('Manager dashboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Manager dashboard error:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      throw handleError(error);
    }
  },
  getEmployeeDashboard: async () => {
    try {
      console.log('Fetching employee dashboard data');
      const response = await axios.get(`${API_URL}/api/dashboard/employee`);
      console.log('Employee dashboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Employee dashboard error:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      throw handleError(error);
    }
  },
    // Feedback requests
  createFeedbackRequest: () => api.post('/api/feedback-requests/', {}),
  getFeedbackRequests: () => api.get('/api/feedback-requests/'),
  
  // Tags
  getAllTags: () => api.get('/api/tags/'),
  getFeedbackTags: (feedbackId) => api.get(`/api/feedback/${feedbackId}/tags/`),
  addTagsToFeedback: (feedbackId, tags) => api.post(`/api/feedback/${feedbackId}/tags/`, tags),
  
  // Notifications
  getNotifications: () => api.get('/api/notifications/'),
  markNotificationAsRead: (id) => api.put(`/api/notifications/${id}/read`, {}),
};

// Error handling helper
function handleError(error) {
  console.error('API error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
    console.error('Response data:', error.response.data);
    
    let message = 'An error occurred';
    
    // Check for authentication issues
    if (error.response.status === 401) {
      message = 'Authentication failed. Please sign in again.';
      // Clear token to force re-login
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } else if (error.response.status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (error.response.data) {
      if (error.response.data.detail) {
        // Handle FastAPI validation errors which come as an array
        if (Array.isArray(error.response.data.detail)) {
          message = error.response.data.detail
            .map(err => `${err.loc.slice(1).join('.')}: ${err.msg}`)
            .join('; ');
        } else {
          message = error.response.data.detail;
        }
      } else if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else {
        message = `Server error: ${error.response.status}`;
      }
    }
    
    return new Error(message);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    
    // Check network connectivity
    const isOnline = navigator.onLine;
    if (!isOnline) {
      return new Error('You are offline. Please check your internet connection.');
    }
    
    return new Error('No response from server. Please check your connection and ensure both backend and frontend servers are running.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
    return error;
  }
}

export default api;
