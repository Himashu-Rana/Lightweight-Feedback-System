import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Divider,
  Button,
  Grid
} from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../context/AuthContext';

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
    day: 'numeric'
  });
};

const FeedbackCard = ({ feedback, employeeName = null, onAcknowledge = null }) => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';
  
  return (
    <Card className="feedback-card" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="subtitle1" component="div" fontWeight="bold">
              {employeeName ? `Feedback for ${employeeName}` : 'Feedback'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(feedback.created_at)}
              {feedback.created_at !== feedback.updated_at && ' (edited)'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              icon={getSentimentIcon(feedback.sentiment)} 
              label={feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
              color={getSentimentColor(feedback.sentiment)}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            {feedback.is_acknowledged ? (
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Acknowledged" 
                color="success"
                size="small"
                variant="outlined"
              />
            ) : (
              <Chip 
                icon={<AccessTimeIcon />} 
                label="Pending" 
                color="default"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2" color="text.secondary" fontWeight="bold">
          Strengths:
        </Typography>
        <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {feedback.strengths}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" fontWeight="bold">
          Areas to Improve:
        </Typography>
        <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {feedback.areas_to_improve}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            component={RouterLink} 
            to={`/feedback/${feedback.id}`} 
            color="primary" 
            size="small"
            onClick={(e) => {
              console.log(`View Details clicked for feedback ID: ${feedback.id}`);
              // Don't prevent default - let the RouterLink handle navigation
            }}
          >
            View Details
          </Button>
          
          {isEmployee && !feedback.is_acknowledged && onAcknowledge && (
            <Button 
              color="success" 
              size="small" 
              variant="contained"
              onClick={() => onAcknowledge(feedback.id)}
            >
              Acknowledge
            </Button>
          )}
          
          {isManager && (
            <Button 
              component={RouterLink} 
              to={`/feedback/${feedback.id}`} 
              color="secondary" 
              size="small"
              variant="outlined"
            >
              Edit
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
