import React, { useState } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import ChatBox from './components/ChatBox';
import AgentList from './components/AgentList';


const App = () => {
  const [agents, setAgents] = useState([]);

  const handleCreateAgent = (details) => {
    const newAgent = { id: agents.length + 1, ...details };
    setAgents([...agents, newAgent]);
  };

  return (
    <Container
      sx={{
        height: '100vh',        
        py: 3,
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
      }}
    >
      <Typography variant="h4" align="center" sx={{ mb: 3, color: '#1976d2' }}>
        Agent Generator
      </Typography>
      <Grid container spacing={3} sx={{ height: 'calc(100% - 64px)' }}>
        <Grid item xs={9}>
          <ChatBox onCreateAgent={handleCreateAgent} />
        </Grid>
        <Grid item xs={3}>
          <AgentList agents={agents} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
