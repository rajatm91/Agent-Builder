import React, { useState } from 'react';
import { Box, Grid, Typography, IconButton, Paper } from '@mui/material';
import { Chat, GroupAdd } from '@mui/icons-material'; // Import necessary icons
import ChatBox from './components/ChatBox';
import AgentList from './components/AgentList';

const App = () => {
  const [agents, setAgents] = useState([]);

  const handleCreateAgent = (details) => {
    const newAgent = { id: agents.length + 1, ...details };
    setAgents([...agents, newAgent]);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
      }}
    >
      {/* Header Section with Icons and Title */}
      <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, mb: 3, backgroundColor: '#fff', borderRadius: 2 }}>
        <IconButton sx={{ mr: 2 }}>
          <Chat sx={{ color: '#1976d2' }} />
        </IconButton>
        <Typography variant="h4" align="center" sx={{ flexGrow: 1, color: '#1976d2' }}>
          Agent Generator
        </Typography>
        <IconButton sx={{ ml: 2 }}>
          <GroupAdd sx={{ color: '#1976d2' }} />
        </IconButton>
      </Paper>

      {/* Main Content Section */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* ChatBox Section */}
          <Grid item xs={12} md={9}>
            <ChatBox onCreateAgent={handleCreateAgent} />
          </Grid>
          {/* Agent List Section */}
          <Grid item xs={12} md={3}>
            <AgentList agents={agents} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default App;
