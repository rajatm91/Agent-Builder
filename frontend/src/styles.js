

const classes = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 32px",
    backgroundColor: "#ffffff",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  tabButton: {
    width: "150px",
    margin: "0 8px",
    textTransform: "capitalize",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "16px",
  },
  selectedTab: {
    backgroundColor: "#00796b",
    color: "#ffffff",
  },
  leftPanel: {
    width: "250px",
    padding: "16px",
    backgroundColor: "#f5f5f5",
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
  },
  panelButton: {
    width: "100%",
    marginBottom: "12px",
    textTransform: "capitalize",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#00796b",
      color: "#ffffff",
    },
  },
  drawer: {
    width: "300px",
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: "300px",
      backgroundColor: "#ffffff",
      padding: "16px",
      boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
    },
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  closeButton: {
    padding: "8px 16px",
    textTransform: "capitalize",
    borderRadius: "8px",
    backgroundColor: "#00796b",
    color: "#ffffff",
  },
};

export default classes;
