import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
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
        // shift header to the right so it doesn't sit under the sidebar (desktop only)
        ml: { xs: 0, sm: "220px" },
        width: { xs: "100%", sm: "calc(100% - 220px)" },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Hamburger menu for mobile */}
          <IconButton
            color="inherit"
            onClick={onMenuClick}
            sx={{
              display: { xs: "flex", sm: "none" },
              p: 0.5,
            }}
          >
            <MenuIcon sx={{ fontSize: 24 }} />
          </IconButton>

          {/* Page title - visible on all breakpoints now */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              display: "block",
            }}
          >
            Recommendations
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12,
              display: "block",
            }}
          >
            {formattedDate}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12,
              display: "block",
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
