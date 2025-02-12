import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Icon,
  Typography,
  CircularProgress,
  Alert,
  Collapse,
  Divider,
  Paper,
  Box
} from "@mui/material";
// import { Memory as ModelIcon, ExpandLess, ExpandMore } from "@mui/icons-material"; 
import useAPIResponse from "../hooks/useGetAgentList";

const ModelsList = () => {
  const [selectedModel, setSelectedModel] = useState(null);

  const { response: models, loading, error } = useAPIResponse("models", {
    user_id: "guestuser@gmail.com"
  });

  const handleModelClick = (model) => {
    setSelectedModel(selectedModel?.id === model.id ? null : model); // Toggle accordion
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 3 }}>
      {/* Loading Indicator */}
      {loading && <CircularProgress sx={{ display: "block", mx: "auto", my: 3 }} />}

      {/* Error Message */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Models List */}
      {!loading && !error && models?.length > 0 && (
        <Paper elevation={3} sx={{ borderRadius: 2, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }} color="primary">
            Available Models
          </Typography>
          <List>
            {models.map((model) => (
              <Box key={model.id}>
                {/* Model List Item */}
                <ListItem 
                  button 
                  onClick={() => handleModelClick(model)}
                  sx={{
                    borderRadius: 1,
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#f5f5f5" }
                  }}
                >
                  {/* <Icon sx={{ mr: 2, color: "primary.main" }}>
                    <ModelIcon />
                  </Icon> */}
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {model.model}
                      </Typography>
                    }
                    secondary={model.description}
                  />
                  {/* {selectedModel?.id === model.id ? <ExpandLess /> : <ExpandMore />} */}
                </ListItem>
                
                {/* Divider */}
                <Divider />

                {/* Model Details (Collapsible Section) */}
                <Collapse in={selectedModel?.id === model.id} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 4, py: 2, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Model:</strong> {model.model}
                    </Typography>
                    <Typography variant="body2">
                      <strong>API Type:</strong> {model.api_type || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Base URL:</strong> {model.base_url || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>API Version:</strong> {model.api_version || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Created At:</strong> {new Date(model.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* No Models Available */}
      {!loading && !error && models?.length === 0 && (
        <Typography align="center" color="textSecondary">
          No models available
        </Typography>
      )}
    </Box>
  );
};

export default ModelsList;
