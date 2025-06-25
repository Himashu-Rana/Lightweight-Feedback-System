import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Component for exporting feedback to PDF
 */
const FeedbackExportButton = ({ feedback, buttonProps = {} }) => {
  const [exporting, setExporting] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const exportToPDF = async () => {
    if (!feedback) return;
    
    setExporting(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Feedback Report', 15, 15);
      
      // Add metadata
      doc.setFontSize(12);
      doc.text(`Date: ${formatDate(feedback.created_at)}`, 15, 25);
      doc.text(`Feedback ID: ${feedback.id}`, 15, 30);
      doc.text(`Type: ${feedback.sentiment.toUpperCase()}`, 15, 35);
      
      // Add feedback content
      doc.setFontSize(14);
      doc.text('Feedback', 15, 45);
      
      // Split text into lines to avoid overflow
      const contentLines = doc.splitTextToSize(feedback.content || "", 180);
      doc.setFontSize(12);
      doc.text(contentLines, 15, 55);
      
      let yPosition = 55 + contentLines.length * 7;
      
      // Add strengths
      doc.setFontSize(14);
      doc.text('Strengths', 15, yPosition);
      const strengthsLines = doc.splitTextToSize(feedback.strengths || "", 180);
      doc.setFontSize(12);
      doc.text(strengthsLines, 15, yPosition + 10);
      
      yPosition = yPosition + 10 + strengthsLines.length * 7;
      
      // Add areas to improve
      doc.setFontSize(14);
      doc.text('Areas to Improve', 15, yPosition);
      const areasLines = doc.splitTextToSize(feedback.areas_to_improve || "", 180);
      doc.setFontSize(12);
      doc.text(areasLines, 15, yPosition + 10);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 15, 280);
      
      // Save the PDF
      doc.save(`Feedback_${feedback.id}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // Show an alert or message to the user
      alert('Failed to export PDF. Please try again later.');
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <Button
      variant="outlined"
      color="info"
      startIcon={exporting ? <CircularProgress size={20} /> : <GetAppIcon />}
      onClick={exportToPDF}
      disabled={exporting || !feedback}
      {...buttonProps}
    >
      {exporting ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
};

export default FeedbackExportButton;
