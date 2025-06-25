import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import PeopleIcon from '@mui/icons-material/People';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackCard from '../components/FeedbackCard';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isManager = user?.role === 'manager';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = isManager 
          ? await api.getManagerDashboard()
          : await api.getEmployeeDashboard();
        
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isManager]);

  const handleCreateRequest = async () => {
    try {
      await api.createFeedbackRequest();
      navigate('/requests');
    } catch (err) {
      console.error('Failed to create feedback request:', err);
    }
  };

  const handleAcknowledgeFeedback = async (feedbackId) => {
    try {
      await api.acknowledgeFeedback(feedbackId);
      
      // Refresh dashboard data
      const data = await api.getEmployeeDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to acknowledge feedback:', err);
    }
  };

  // Chart data for feedback sentiment
  const getSentimentChartData = () => {
    if (!dashboardData) return null;
    
    const sentiments = dashboardData.feedback_by_sentiment;
    
    return {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [
        {
          data: [
            sentiments.positive || 0,
            sentiments.neutral || 0,
            sentiments.negative || 0
          ],
          backgroundColor: [
            'rgba(76, 175, 80, 0.6)',
            'rgba(255, 183, 77, 0.6)',
            'rgba(244, 67, 54, 0.6)'
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(255, 183, 77, 1)',
            'rgba(244, 67, 54, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
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
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error loading dashboard
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
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
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={isManager ? 4 : 6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                backgroundColor: 'primary.main', 
                borderRadius: '50%', 
                p: 1, 
                display: 'flex',
                mr: 2
              }}>
                <FeedbackIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" component="div">
                  {dashboardData.feedback_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isManager ? 'Feedback Given' : 'Feedback Received'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {isManager && (
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  backgroundColor: 'secondary.main', 
                  borderRadius: '50%', 
                  p: 1, 
                  display: 'flex',
                  mr: 2
                }}>
                  <PeopleIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" component="div">
                    {dashboardData.employees_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team Members
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
        
        <Grid item xs={12} md={isManager ? 4 : 6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                backgroundColor: 'success.main', 
                borderRadius: '50%', 
                p: 1, 
                display: 'flex',
                mr: 2
              }}>
                <SentimentSatisfiedAltIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" component="div">
                  {dashboardData.feedback_by_sentiment.positive || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Positive Feedback
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Sentiment Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Feedback Sentiment
            </Typography>
            <Box sx={{ height: 270, display: 'flex', justifyContent: 'center' }}>
              {getSentimentChartData() && dashboardData.feedback_count > 0 ? (
                <Doughnut 
                  data={getSentimentChartData()} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <Typography color="text.secondary">
                    No feedback data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Feedback */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Feedback
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {dashboardData.recent_feedback && dashboardData.recent_feedback.length > 0 ? (
                dashboardData.recent_feedback.map((feedback, index) => (
                  <Box key={feedback.id} sx={{ mb: index < dashboardData.recent_feedback.length - 1 ? 2 : 0 }}>
                    <FeedbackCard 
                      feedback={feedback} 
                      onAcknowledge={!isManager ? handleAcknowledgeFeedback : null}
                    />
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No recent feedback
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
