import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Collapse,
  Divider,
  Box,
  ListItemIcon
} from "@mui/material";
import { ExpandMore, ExpandLess, Memory } from "@mui/icons-material";

const ModelsList = ({ models }) => {
  const [selectedModel, setSelectedModel] = useState(null);

  const handleModelClick = (model) => {
    setSelectedModel(selectedModel?.id === model.id ? null : model); // Toggle accordion
  };

  return models?.length > 0 ? (
    <List>
      {models.map((model) => (
        <Box
          sx={{
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
          }}
          key={model.id}
        >
          {/* Model List Item */}
          <ListItem
            button
            onClick={() => handleModelClick(model)}
            sx={{
              "&:hover": { backgroundColor: "#e3f2fd" },
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              transition: "background 0.2s ease-in-out"
            }}
          >
            {/* Icon */}

            <ListItemIcon sx={{ minWidth: 45 }}>
              <Memory sx={{ color: "#1565c0", fontSize: "30px" }} />
            </ListItemIcon>

            {/* Model Info */}

            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", color: "#0d47a1" }}
                >
                  {model.model}
                </Typography>
              }
              secondary={
                <Typography variant="body2" sx={{ color: "#546e7a" }}>
                  {model.description}
                </Typography>
              }
            />

            {/* Expand/Collapse Icon */}
            <IconButton
              sx={{
                transition: "transform 0.3s",
                transform:
                  selectedModel?.id === model.id
                    ? "rotate(180deg)"
                    : "rotate(0deg)"
              }}
            >
              {selectedModel?.id === model.id ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
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
                borderRadius: "8px",
                margin: "8px",
                boxShadow: "inset 0px 0px 8px rgba(0,0,0,0.1)"
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Model:</strong> {model.model}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>API Type:</strong> {model.api_type || "N/A"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Base URL:</strong> {model.base_url || "N/A"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
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
  ) : (
    <Typography
      variant="body1"
      sx={{ textAlign: "center", color: "gray", mt: 3 }}
    >
      No models available
    </Typography>
  );
};

export default ModelsList;
