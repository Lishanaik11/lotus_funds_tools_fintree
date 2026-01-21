import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";

const Header = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = now.toLocaleDateString("en-US");
  const formattedTime = now.toLocaleTimeString("en-US");

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#22c55e",
        minHeight: 40,
        justifyContent: "center",
        // shift header to the right so it doesn't sit under the sidebar
        ml: "220px",
        width: "calc(100% - 220px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 40,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          Recommendations
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {formattedDate}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {formattedTime}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
