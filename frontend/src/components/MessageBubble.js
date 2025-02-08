import React from 'react';
import { Paper, Typography } from '@mui/material';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        margin: '8px 0',
      }}
    >
      <Paper
        elevation={3}
        style={{
          padding: '10px 16px',
          backgroundColor: isUser ? '#1976d2' : '#f5f5f5',
          color: isUser ? '#fff' : '#000',
          maxWidth: '70%',
          borderRadius: isUser ? '15px 15px 0 15px' : '15px 15px 15px 0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="body1">{message}</Typography>
      </Paper>
    </div>
  );
};

export default MessageBubble;