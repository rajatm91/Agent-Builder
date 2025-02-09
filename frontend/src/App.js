import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
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
      {/* Header Section */}
      <Typography variant="h4" align="center" sx={{ py: 2, color: '#1976d2' }}>
        Agent Generator
      </Typography>

      {/* Main Content Section */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid item xs={9}>
            <ChatBox onCreateAgent={handleCreateAgent} />
          </Grid>
          <Grid item xs={3}>
            <AgentList agents={agents} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default App;
