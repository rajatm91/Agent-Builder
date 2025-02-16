import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Icon,
  Typography,  
  Collapse,
  Divider,  
  Box,
  ListItemIcon
} from "@mui/material";
import { ExpandMore, ExpandLess, Memory } from "@mui/icons-material"; // Import the icons

const ModelsList = ({models}) => {
  const [selectedModel, setSelectedModel] = useState(null);

  const handleModelClick = (model) => {
    setSelectedModel(selectedModel?.id === model.id ? null : model); // Toggle accordion
  };

  return (
    <Box>
      {/* Models List */}
      {models?.length > 0 && (
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
                {/* Icon */}
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Memory color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {model.model}
                    </Typography>
                  }
                  secondary={model.description}
                />

                {/* Expand/Collapse Icon */}
                <Icon
                  sx={{
                    ml: "auto",
                    transform:
                      selectedModel?.id === model.id
                        ? "rotate(360deg)"
                        : "rotate(0deg)",
                    transition: "transform 0.3s"
                  }}
                >
                  {selectedModel?.id === model.id ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </Icon>
              </ListItem>

              {/* Divider */}
              <Divider />

              {/* Model Details (Collapsible Section) */}
              <Collapse
                in={selectedModel?.id === model.id}
                timeout="auto"
                unmountOnExit
              >
                <Box
                  sx={{
                    pl: 4,
                    py: 2,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 1
                  }}
                >
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
                    <strong>Created At:</strong>{" "}
                    {new Date(model.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          ))}
        </List>
      )}

      {/* No Models Available */}
      {models?.length === 0 && (
        <Typography align="center" color="textSecondary">
          No models available
        </Typography>
      )}
    </Box>
  );
};

export default ModelsList;
