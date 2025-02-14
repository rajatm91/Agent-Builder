import React from "react";
import { Box } from "@mui/material";

// Component to display local image
const ImageDisplay = ({ src, alt, width = "auto", height = "auto" }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img
        src={src}
        alt={alt}
        style={{ width: width, height: height, objectFit: "contain" }}
      />
    </Box>
  );
};

export default ImageDisplay;
