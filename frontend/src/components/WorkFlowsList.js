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
import { Work } from "@mui/icons-material"; // Use Work icon for workflows
import useAPIResponse from "../hooks/useGetAgentList";

const WorkFlowsList = () => {
  const [selectWorkFlows, setSelectedWorkFlows] = useState(null);

  // Fetch workflows using custom hook
  const {
    response: workflows,
    loading,
    error
  } = useAPIResponse("workflows", { user_id: "guestuser@gmail.com" });

  const handleWorkFlowItem = (workflow) => {
    setSelectedWorkFlows(
      selectWorkFlows?.id === workflow.id ? null : workflow // Toggle accordion open/close
    );
  };

  return (
    <div>
      {/* Show loading indicator */}
      {loading && <CircularProgress />}

      {/* Show error message if API fails */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Render workflows list */}
      {!loading && !error && workflows?.length > 0 && (
        <List>
          {workflows.map((workflow) => (
            <div key={workflow.id}>
              <ListItem
                button
                onClick={() => handleWorkFlowItem(workflow)}
              >
                <Icon sx={{ mr: 2 }}>
                  <Work /> {/* Use Work icon for workflows */}
                </Icon>
                <ListItemText primary={workflow.name} />
              </ListItem>
              <Divider /> {/* Divider between items */}
              {/* Accordion Details */}
              <Collapse in={selectWorkFlows?.id === workflow.id}>
                <div style={{ paddingLeft: 20 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Description:</strong> {workflow.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Type:</strong> {workflow.type}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Summary Method:</strong> {workflow.summary_method}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Created At:</strong> {new Date(workflow.created_at).toLocaleString()}
                  </Typography>
                </div>
              </Collapse>
            </div>
          ))}
        </List>
      )}

      {/* If there are no workflows */}
      {!loading && !error && workflows?.length === 0 && (
        <Typography>No workflows available</Typography>
      )}
    </div>
  );
};

export default WorkFlowsList;
