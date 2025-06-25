import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Switch,
  Divider
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TagSelector from '../components/TagSelector';

const CreateFeedback = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
    // Form state
  const [content, setContent] = useState('');
  const [strengths, setStrengths] = useState('');
  const [areasToImprove, setAreasToImprove] = useState('');
  const [sentiment, setSentiment] = useState('neutral');
  const [tags, setTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formError, setFormError] = useState('');
  
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Fetch employee details
        const data = await api.get(`/api/users/${employeeId}`);
        setEmployee(data);
      } catch (err) {
        setError(err.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [employeeId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!content.trim() || !strengths.trim() || !areasToImprove.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }
    
    setSubmitting(true);
    setFormError('');
    
    try {
      // Ensure the authentication token is set
      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('You need to be logged in to submit feedback. Please sign in again.');
        setSubmitting(false);
        return;
      }
      
      // Set the token explicitly before the request
      api.setToken(token);
      
      const feedbackData = {
        content,
        strengths,
        areas_to_improve: areasToImprove,
        sentiment,
        employee_id: parseInt(employeeId),
        is_anonymous: isAnonymous,
        tags: tags
      };
      
      console.log('Submitting feedback data:', feedbackData);
      
      await api.createFeedback(feedbackData);
      setSuccess(true);
        // Clear form
      setContent('');
      setStrengths('');
      setAreasToImprove('');
      setSentiment('neutral');
      setTags([]);
      setIsAnonymous(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/feedback');
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFormError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
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
      <Typography variant="h4" component="h1" gutterBottom>
        Create Feedback
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
      </Card>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Feedback submitted successfully! Redirecting...
        </Alert>
      )}
      
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Overall Feedback"
                multiline
                rows={3}
                fullWidth
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide a summary of your feedback for this employee."
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Strengths"
                multiline
                rows={4}
                fullWidth
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What is this employee doing well? What are their strongest skills and contributions?"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Areas to Improve"
                multiline
                rows={4}
                fullWidth
                value={areasToImprove}
                onChange={(e) => setAreasToImprove(e.target.value)}
                placeholder="What areas could this employee focus on improving? What specific suggestions do you have for growth?"
                required
              />
            </Grid>
              <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Overall Sentiment</FormLabel>
                <RadioGroup
                  row
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
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
            
            <Grid item xs={12}>
              <TagSelector 
                value={tags} 
                onChange={setTags} 
                label="Feedback Tags" 
                placeholder="Add relevant tags (e.g., communication, teamwork)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Submit as anonymous"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  The employee will not see who submitted this feedback.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateFeedback;
