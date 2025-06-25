import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Divider,
  TextField,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import ReactMarkdown from 'react-markdown';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackExportButton from '../components/FeedbackExportButton';

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return <SentimentSatisfiedAltIcon className="sentiment-positive" />;
    case 'neutral':
      return <SentimentNeutralIcon className="sentiment-neutral" />;
    case 'negative':
      return <SentimentVeryDissatisfiedIcon className="sentiment-negative" />;
    default:
      return <SentimentNeutralIcon />;
  }
};

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return 'success';
    case 'neutral':
      return 'warning';
    case 'negative':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [feedback, setFeedback] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    strengths: '',
    areas_to_improve: '',
    sentiment: ''
  });
  
  // Comment
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const isManager = user?.role === 'manager';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching feedback details for ID:', id);
        
        // Fetch feedback data
        const feedbackData = await api.getFeedback(id);
        console.log('Feedback data received:', feedbackData);
        setFeedback(feedbackData);
        
        // Set edit data
        setEditData({
          strengths: feedbackData.strengths,
          areas_to_improve: feedbackData.areas_to_improve,
          sentiment: feedbackData.sentiment
        });
        
        // Get employee and manager details if needed
        try {
          if (isManager) {
            console.log('Fetching employee data for ID:', feedbackData.employee_id);
            const employeeData = await api.get(`/api/users/${feedbackData.employee_id}`);
            console.log('Employee data received:', employeeData);
            setEmployee(employeeData);
          } else {
            console.log('Fetching manager data for ID:', feedbackData.manager_id);
            const managerData = await api.get(`/api/users/${feedbackData.manager_id}`);
            console.log('Manager data received:', managerData);
            setManager(managerData);
          }
        } catch (userErr) {
          console.error('Error fetching user details:', userErr);
          // Just continue with the feedback data even if user details couldn't be fetched
          // This way the feedback details can still be displayed
        }
      } catch (err) {
        console.error('Error fetching feedback details:', err);
        console.error('Error details:', err.response ? err.response.data : 'No response data');
        setError(err.message || 'Failed to load feedback data. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isManager]);
  
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    
    // Reset edit data when canceling
    if (isEditMode) {
      setEditData({
        strengths: feedback.strengths,
        areas_to_improve: feedback.areas_to_improve,
        sentiment: feedback.sentiment
      });
    }
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveEdit = async () => {
    try {
      await api.updateFeedback(id, editData);
      
      // Update local state with new data
      setFeedback(prev => ({
        ...prev,
        ...editData,
        updated_at: new Date().toISOString()
      }));
      
      setIsEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update feedback');
    }
  };
  
  const handleAcknowledge = async () => {
    try {
      await api.acknowledgeFeedback(id);
      
      // Update local state
      setFeedback(prev => ({
        ...prev,
        is_acknowledged: true
      }));
    } catch (err) {
      setError(err.message || 'Failed to acknowledge feedback');
    }
  };
  
  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      const newComment = await api.commentOnFeedback(id, comment);
      
      // Update local state
      setFeedback(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
      
      // Clear comment field
      setComment('');
    } catch (err) {
      setError(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
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
          Feedback Detail
        </Typography>
        
        <Box>
          {isManager && (
            <Button
              variant={isEditMode ? "outlined" : "contained"}
              color={isEditMode ? "error" : "primary"}
              onClick={handleEditToggle}
              sx={{ mr: 1 }}
            >
              {isEditMode ? 'Cancel' : 'Edit Feedback'}
            </Button>
          )}
          
          {!isManager && !feedback.is_acknowledged && (
            <Button
              variant="contained"
              color="success"
              onClick={handleAcknowledge}
              sx={{ mr: 1 }}
            >
              Acknowledge Feedback
            </Button>
          )}
          
          <FeedbackExportButton 
            feedback={feedback} 
            buttonProps={{ 
              sx: { mr: isEditMode ? 1 : 0 } 
            }} 
          />
          
          {isEditMode && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {isManager ? 'Employee' : 'Manager'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                {isManager 
                  ? (employee?.full_name || '?').charAt(0).toUpperCase()
                  : (manager?.full_name || '?').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1">
                  {isManager 
                    ? employee?.full_name || 'Employee details unavailable' 
                    : manager?.full_name || 'Manager details unavailable'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isManager 
                    ? employee?.email || 'No email available' 
                    : manager?.email || 'No email available'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(feedback.created_at)}
            </Typography>
            {feedback.created_at !== feedback.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Updated: {formatDate(feedback.updated_at)}
              </Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                icon={getSentimentIcon(feedback.sentiment)} 
                label={feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
                color={getSentimentColor(feedback.sentiment)}
                variant="outlined"
              />
              
              {feedback.is_acknowledged && (
                <Chip 
                  label="Acknowledged" 
                  color="success"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {isEditMode ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Strengths"
                    name="strengths"
                    value={editData.strengths}
                    onChange={handleEditChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Areas to Improve"
                    name="areas_to_improve"
                    value={editData.areas_to_improve}
                    onChange={handleEditChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Overall Sentiment</FormLabel>
                    <RadioGroup
                      row
                      name="sentiment"
                      value={editData.sentiment}
                      onChange={handleEditChange}
                    >
                      <FormControlLabel 
                        value="positive" 
                        control={<Radio color="success" />} 
                        label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SentimentSatisfiedAltIcon color="success" sx={{ mr: 0.5 }} /> Positive
                        </Box>} 
                      />
                      <FormControlLabel 
                        value="neutral" 
                        control={<Radio color="warning" />} 
                        label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SentimentNeutralIcon color="warning" sx={{ mr: 0.5 }} /> Neutral
                        </Box>} 
                      />
                      <FormControlLabel 
                        value="negative" 
                        control={<Radio color="error" />} 
                        label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SentimentVeryDissatisfiedIcon color="error" sx={{ mr: 0.5 }} /> Needs Improvement
                        </Box>}  
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Strengths
                </Typography>
                <ReactMarkdown>
                  {feedback.strengths}
                </ReactMarkdown>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Areas to Improve
                </Typography>
                <ReactMarkdown>
                  {feedback.areas_to_improve}
                </ReactMarkdown>
              </>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            
            {feedback.comments && feedback.comments.length > 0 ? (
              <List>
                {feedback.comments.map(comment => (
                  <ListItem key={comment.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', px: 0 }}>
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <Typography variant="subtitle2">
                        {comment.user_id === feedback.manager_id ? 'Manager' : 'Employee'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2, alignSelf: 'center' }}>
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>
                    <ReactMarkdown>
                      {comment.comment}
                    </ReactMarkdown>
                    <Divider sx={{ width: '100%', my: 1 }} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No comments yet
              </Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Add a comment"
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Enter your comment here..."
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !comment.trim()}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackDetail;
