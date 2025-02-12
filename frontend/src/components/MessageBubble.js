import React from "react";
import { Box, Typography } from "@mui/material";
import { formatMessage } from "../utils/userDetails";

// MessageBubble component displays a chat bubble for a user or bot message.
const MessageBubble = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        display: "flex", // Aligns the message bubbles in a row
        alignItems: "center", // Vertically centers the items
        justifyContent: isUser ? "flex-end" : "flex-start", // Aligns based on whether the message is from the user or bot
        mb: 1, // Adds margin at the bottom of each message
      }}
    >
      {/* Optional: Add user or bot avatar icon if needed */}
      {/* {!isUser && <SmartToyIcon sx={{ mr: 1, color: "blue" }} />} */}

      <Box
        sx={{
          backgroundColor: isUser ? "#1976d2" : "#e0e0e0", // Set different background color for user vs bot
          color: isUser ? "#fff" : "#000", // Change text color based on the sender
          padding: "10px", // Add padding inside the bubble
          borderRadius: "10px", // Rounded corners for the bubble
          maxWidth: "70%", // Max width of the bubble
          wordBreak: "break-word", // Ensure long words break onto the next line if needed
        }}
      >
        <Typography component="div">{formatMessage(message)}</Typography> {/* Formats the message */}
      </Box>      
      {/* Optional: Add user icon for user messages */}
      {/* {isUser && <PersonIcon sx={{ ml: 1, color: "green" }} />} */}
    </Box>
  );
};

export default MessageBubble;
