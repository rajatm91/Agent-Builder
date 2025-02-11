import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Collapse,
  Divider
} from "@mui/material";

import useAPIResponse from "../hooks/useGetAgentList";

const AgentList = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const {
    response: agentsNew,
    loading,
    error
  } = useAPIResponse("agents", { user_id: "guestuser@gmail.com" });

  const handleAgentClick = (agent) => {
    // setSelectedAgent(agent);
    setSelectedAgent(
      selectedAgent?.id === agent.id ? null : agent // Toggle accordion open/close
    );
    console.log("*******AGENT********", agent);
  };

  return (
    <div>
      {/* Show loading indicator */}
      {loading && <CircularProgress />}

      {/* Show error message if API fails */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Render agents list */}

      {!loading && !error && agentsNew?.length > 0 && (
        <List>
          {agentsNew?.map((agent) => (
            <div key={agent?.id}>
              <ListItem button onClick={() => handleAgentClick(agent)}>
                <ListItemText
                  primary={agent.config?.name || "No Name"}
                  secondary={agent.user_id || "No Type"}
                />
              </ListItem>
              <Divider /> {/* Divider between items */}
              {/* Accordion Details */}
              <Collapse in={selectedAgent?.id === agent?.id}>
                <div style={{ paddingLeft: 20 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>UserID:</strong> {selectedAgent?.id || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Type:</strong> {selectedAgent?.type || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Name:</strong>{" "}
                    {selectedAgent?.config?.name || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>System Message:</strong>{" "}
                    {selectedAgent?.config?.system_message || "N/A"}
                  </Typography>
                </div>
              </Collapse>
            </div>
          ))}
        </List>
      )}

      {/* If there are no agents */}
      {!loading && !error && agentsNew?.length === 0 && (
        <Typography>No Agents available</Typography>
      )}
    </div>
  );
};

export default AgentList;
