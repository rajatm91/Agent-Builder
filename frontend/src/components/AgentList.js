import React, { useState } from 'react';
import { List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, Button, Typography } from '@mui/material';
import ChatBox from './ChatBox'; 

const AgentList = ({ agents }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openChatBox, setOpenChatBox] = useState(false);

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setOpenChatBox(true);
  };

  return (
    <div>
      <List>
        {agents?.map((agent, index) => (
          <ListItem button key={index} onClick={() => handleAgentClick(agent)}>
            <ListItemText primary={agent.name} secondary={agent.role} />
          </ListItem>
        ))}
      </List>

      {/* ChatBox Popup */}
      <Dialog open={openChatBox} onClose={() => setOpenChatBox(false)} fullWidth maxWidth="md">
        <DialogContent>
          {selectedAgent ? (
            <>
              <Typography variant="h6">Agent Details</Typography>
              <Typography variant="body1"><strong>Name:</strong> {selectedAgent.name}</Typography>
              <Typography variant="body1"><strong>Role:</strong> {selectedAgent.role}</Typography>
              <Typography variant="body1"><strong>Skills:</strong> {selectedAgent.skills || 'N/A'}</Typography>
              <Typography variant="body1"><strong>Document Path:</strong> {selectedAgent.documentPath || 'N/A'}</Typography>
            </>
          ) : (
            <Typography variant="body1">No agent selected.</Typography>
          )}
          <ChatBox selectedAgent={selectedAgent} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChatBox(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AgentList;
