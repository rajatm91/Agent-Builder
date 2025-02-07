
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const AgentDetailsModal = ({ open, onClose, onSubmit, initialDetails }) => {
  const [details, setDetails] = useState({
    name: '',
    role: '',
    skills: '',
    documentPath: '',
  });

  useEffect(() => {
    if (initialDetails) {
      setDetails(initialDetails);
    }
  }, [initialDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleSubmit = () => {
    onSubmit(details);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Agent Details
        </Typography>
        <TextField
          fullWidth
          label="Agent Name"
          name="name"
          value={details?.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Role"
          name="role"
          value={details?.role}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Skills"
          name="skills"
          value={details?.skills}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Document Path"
          name="documentPath"
          value={details?.documentPath}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
          
          <Button variant="outlined"  onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AgentDetailsModal;