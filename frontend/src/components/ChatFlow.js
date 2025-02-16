import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Person,
  ArrowForward,
  ArrowBack,
  ArrowDownward
} from "@mui/icons-material";

const ChatFlow = () => {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {" "}
        {/* Person Icon */} <Person sx={{ fontSize: 60, mb: 2 }} />{" "}
        {/* Arrow to Agent A */} <ArrowDownward sx={{ fontSize: 30, mb: 2 }} />{" "}
        <Typography>Input</Typography>{" "}
        <ArrowDownward sx={{ fontSize: 30, mb: 2 }} /> {/* Agent A Box */}{" "}
        <Box
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            mb: 2
          }}
        >
          {" "}
          <Typography>Agent A</Typography>{" "}
        </Box>{" "}
        {/* Arrow to Agent B */} <ArrowDownward sx={{ fontSize: 30, mb: 2 }} />{" "}
        {/* Agent B Box */}{" "}
        <Box
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            mb: 2
          }}
        >
          {" "}
          <Typography>Agent B</Typography>{" "}
        </Box>{" "}
        <ArrowDownward sx={{ fontSize: 30, mb: 2 }} />{" "}
        <Typography>Output</Typography> {/* Arrow back to Person */}{" "}
        <ArrowBack sx={{ fontSize: 30, mb: 2 }} />{" "}
      </Box>
    </Box>
  );
};

export default ChatFlow;
