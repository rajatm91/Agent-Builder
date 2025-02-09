import React from "react";
import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person"; // User icon
import SmartToyIcon from "@mui/icons-material/SmartToy"; // Bot icon

const MessageBubble = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 1,
      }}
    >
      {!isUser && <SmartToyIcon sx={{ mr: 1, color: "blue" }} />}

      <Box
        sx={{
          backgroundColor: isUser ? "#1976d2" : "#e0e0e0",
          color: isUser ? "#fff" : "#000",
          padding: "10px",
          borderRadius: "10px",
          maxWidth: "70%",
        }}
      >
        <Typography>{message}</Typography>        
      </Box>
      {isUser && <PersonIcon sx={{ ml: 1, color: "green" }} />}
    </Box>
  );
};

export default MessageBubble;