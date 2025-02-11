import React from "react";
import { Paper, Typography, Box, Button } from "@mui/material";
// import { Edit, CheckCircle, Cancel } from "@mui/icons-material";

const ReviewDetails = ({
  reviewDetails,
  setModalOpen,
  handleCreateAgent,
  handleCancel
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mt: 2,
        borderRadius: 2,
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)"
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Review Details
      </Typography>

      <Typography>Name: {reviewDetails.name}</Typography>
      <Typography>Role: {reviewDetails.role}</Typography>
      <Typography>Skills: {reviewDetails.skills}</Typography>
      <Typography>Document Path: {reviewDetails.documentPath}</Typography>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={() => setModalOpen(true)}
          // startIcon={<Edit />}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateAgent}
          // startIcon={<CheckCircle />}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          // startIcon={<Cancel />}
        >
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

export default ReviewDetails;
