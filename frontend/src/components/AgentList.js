import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Icon,
  Typography,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  AccountCircle,
  Category,
  Badge,
  Message
} from "@mui/icons-material"; // Updated icons
import ChatBox from "./ChatBox";
import useAPIResponse from "../hooks/useGetAgentList";
import AgentChatBox from "./AgentChatBox";

const AgentList = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openChatBox, setOpenChatBox] = useState(false);

  // Fetch agents using custom hook
  const {
    response: agentsNew,
    loading,
    error
  } = useAPIResponse("agents", { user_id: "guestuser@gmail.com" });

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setOpenChatBox(true);
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
          {agentsNew.map((agent) => (
            <ListItem
              button
              key={agent.id}
              onClick={() => handleAgentClick(agent)}
            >
              <Icon sx={{ mr: 2 }}>
                <AccountCircle />
              </Icon>
              <ListItemText
                primary={agent.config?.name || "No Name"} 
                secondary={agent.type || "No Type"}       
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* ChatBox Overlay */}
      {openChatBox && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "80vw",
            height: "100vh",
            backgroundColor: "white",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
            transform: openChatBox ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.5s ease-in-out",
            zIndex: 1000,
            overflowY: "auto"
          }}
        >
          <div
            style={{
              padding: "20px",
              position: "relative"
            }}
          >
            {/* Close Button */}
            <Button
              onClick={() => setOpenChatBox(false)}
              color="primary"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                zIndex: 1100
              }}
            >
              Close
            </Button>

            {/* Agent Details */}
            {selectedAgent ? (
              <>
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", mb: 2 }}
                >
                  <Message sx={{ mr: 1 }} /> Agent Details
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <AccountCircle sx={{ mr: 1 }} /> <strong>User ID: </strong>{" "}
                  {selectedAgent.user_id || "N/A"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Category sx={{ mr: 1 }} /> <strong>Type: </strong>{" "}
                  {selectedAgent.type || "N/A"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Badge sx={{ mr: 1 }} /> <strong>Name: </strong>{" "}
                  {selectedAgent.config?.name || "N/A"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Message sx={{ mr: 1 }} /> <strong>System Messages: </strong>{" "}
                  {selectedAgent.config?.system_message || "N/A"}
                </Typography>                
              </>
            ) : (
              <Typography variant="body1">No agent selected.</Typography>
            )}
            {/* Agent Chat Box Component */}
            <AgentChatBox agent={selectedAgent}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;