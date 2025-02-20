import React from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemText
} from "@mui/material";
import { ModelTraining } from "@mui/icons-material";

const ModelDropdown = ({ editedAgent, handleChange, models }) => {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel>Model</InputLabel>
      <Select
        label="Model"
        name="model"
        value={editedAgent?.config?.retrieve_config?.model || ""}        
        onChange={handleChange}
        renderValue={(selected) => {
          const selectedModel = models.find((m) => m.model === selected);
          return selectedModel
            ? `${selectedModel.model} - ${selectedModel.description}`
            : "";
        }}
        startAdornment={
          <ModelTraining sx={{ color: "gray", marginRight: 1 }} />
        }
      >
        {models.map((model) => (
          <MenuItem key={model.id} value={model.model}>
            <ListItemText primary={model.model} secondary={model.description} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ModelDropdown;
