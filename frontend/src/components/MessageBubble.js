import React from "react";
import { Box, Typography } from "@mui/material";
import { formatMessage } from "../utils/userDetails";
import { Person, SmartToy } from "@mui/icons-material";

const MessageBubble = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        padding:2,
        display: "flex", 
        alignItems: "center",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 1, 
      }}
    >      
      {!isUser && <SmartToy sx={{ mr: 1, color: "#1976d2" }} />}

      <Box
        sx={{
          backgroundColor: isUser ? "#1976d2" : "#e0e0e0",
          color: isUser ? "#fff" : "#000", 
          padding: "10px", 
          borderRadius: "10px",
          maxWidth: "70%", 
          wordBreak: "break-word",
        }}
      >
        <Typography component="div">{formatMessage(message)}</Typography>
      </Box>            
      {isUser && <Person sx={{ ml: 1, color: "#1976d2" }} />}
    </Box>
  );
};

export default MessageBubble;
