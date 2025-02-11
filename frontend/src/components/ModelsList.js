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
  Divider
} from "@mui/material";
// import { Person } from "@mui/icons-material"; // Add relevant icons
import useAPIResponse from "../hooks/useGetAgentList";

const ModelsList = () => {
  const [selectedModel, setSelectedModel] = useState(null);

  const {
    response: models,
    loading,
    error
  } = useAPIResponse("models", { user_id: "guestuser@gmail.com" });

  const handleModelClick = (model) => {
    setSelectedModel(
      selectedModel?.id === model.id ? null : model // Toggle accordion open/close
    );
  };

  return (
    <div>
      {/* Show loading indicator */}
      {loading && <CircularProgress />}

      {/* Show error message if API fails */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Render models list */}
      {!loading && !error && models?.length > 0 && (
        <List>
          {models.map((model) => (
            <div key={model.id}>
              <ListItem button onClick={() => handleModelClick(model)}>
                <Icon sx={{ mr: 2 }}>
                  {/* <Person /> */}
                </Icon>
                <ListItemText
                  primary={model.model}
                  secondary={model.description}
                />
              </ListItem>
              <Divider /> {/* Divider between items */}
              {/* Accordion Details */}
              <Collapse in={selectedModel?.id === model.id}>
                <div style={{ paddingLeft: 20 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Model:</strong> {model.model}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>API Type:</strong> {model.api_type || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Base URL:</strong> {model.base_url || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>API Version:</strong> {model.api_version || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Created At:</strong>{" "}
                    {new Date(model.created_at).toLocaleString()}
                  </Typography>
                </div>
              </Collapse>
            </div>
          ))}
        </List>
      )}

      {/* If there are no models */}
      {!loading && !error && models?.length === 0 && (
        <Typography>No models available</Typography>
      )}
    </div>
  );
};

export default ModelsList;
