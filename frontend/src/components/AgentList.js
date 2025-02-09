import React, { useState } from 'react';
import { List, ListItem, ListItemText, Icon, Typography, Button } from '@mui/material';
import { Person, Work, EmojiObjects, Description, Storage } from '@mui/icons-material'; // Add relevant icons
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
            <Icon sx={{ mr: 2 }}>
              <Person />
            </Icon>
            <ListItemText
              primary={agent?.name}
              secondary={agent?.modelName || agent?.reason}
            />
          </ListItem>
        ))}
      </List>

      {/* ChatBox Overlay */}
      {openChatBox && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '80vw', // 80% of the viewport width
            height: '100vh', // Full viewport height
            backgroundColor: 'white',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.2)', // Shadow effect to give a drawer-like appearance
            transform: openChatBox ? 'translateX(0)' : 'translateX(100%)', // Slide in/out from right to left
            transition: 'transform 0.5s ease-in-out', // Smooth sliding effect
            zIndex: 1000, // Ensure it's on top of other content
            overflowY: 'auto', // To enable scrolling if content overflows
          }}
        >
          <div
            style={{
              padding: '20px',
              position: 'relative', // For positioning the close button
            }}
          >
            {/* Close Button */}
            <Button
              onClick={() => setOpenChatBox(false)}
              color="primary"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1100, // Ensure the button stays above other content
              }}
            >
              Close
            </Button>

            {selectedAgent ? (
              <>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiObjects sx={{ mr: 1 }} /> Agent Details
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} /> <strong>Name:</strong> {selectedAgent.name}
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Storage sx={{ mr: 1 }} /> <strong>Model:</strong> {selectedAgent.modelName || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Description sx={{ mr: 1 }} /> <strong>Document Path:</strong> {selectedAgent.documentPath || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Work sx={{ mr: 1 }} /> <strong>Reason:</strong> {selectedAgent.reason || 'N/A'}
                </Typography>
              </>
            ) : (
              <Typography variant="body1">No agent selected.</Typography>
            )}
            <ChatBox selectedAgent={selectedAgent} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;
