import React from "react";
import { Typography } from "@mui/material";

const PoweredBy = () => {
  return (
    <Typography
      variant="caption"
      color="textSecondary"
      sx={{ marginTop: 1, textAlign: "center", width: "100%" }}
    >
      Powered by{" "}
      <span style={{ fontWeight: "bold", color: "#1976d2" }}>@HDFCBank</span>
    </Typography>
  );
};

export default PoweredBy;
