import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import FolderIcon from '@mui/icons-material/Folder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getNavItemStyles = (active: boolean) => ({
    borderRadius: 999,
    mx: 1.5,
    mb: 0.5,
    px: 2,
    color: active ? "#020617" : "#e5e7eb",
    backgroundColor: active ? "#D8D4F4" : "transparent",
    "&:hover": {
      backgroundColor: "#D8D4F4",
      color: "#020617",
    },
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        [`& .MuiDrawer-paper`]: {
          width: 220,
          backgroundColor: "#4F6CF8",
          color: "white",
          borderRight: "none",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box>
          <List sx={{ mt: 1, mb: 2 }}>
            <ListItemButton
              component={Link}
              to="/"
              sx={{
                color: "inherit",
                py: 2,
                "&:hover": { backgroundColor: "transparent" },
              }}
              disableRipple
            >
              <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                Fintree
              </Typography>
            </ListItemButton>
          </List>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mx: 1.5 }} />

          <List sx={{ mt: 2 }}>
            <ListItemButton
              component={Link}
              to="/"
              sx={getNavItemStyles(isActive("/"))}
            >
              <DashboardIcon sx={{ mr: 1.5 }} />
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/recommendations"
              sx={getNavItemStyles(isActive("/recommendations"))}
            >
              <CheckBoxIcon sx={{ mr: 1.5 }} />
              <ListItemText primary="Recommendations" />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/performance"
              sx={getNavItemStyles(isActive("/performance"))}
            >
              <FolderIcon sx={{ mr: 1.5 }} />
              <ListItemText primary="Performance" />
            </ListItemButton>
            <ListItemButton
              sx={{
                mx: 1.5,
                mt: 0.5,
                px: 2,
                color: "#e5e7eb",
                "&:hover": {
                  backgroundColor: "rgba(15,23,42,0.15)",
                },
              }}
            >
              <MoreHorizIcon sx={{ mr: 1.5 }} />
              <ListItemText primary="Extra option" />
            </ListItemButton>
          </List>
        </Box>

        <Box sx={{ mt: "auto", pb: 2 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mx: 1.5 }} />
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#D8D4F4",
                  color: "#020617",
                  fontSize: 18,
                }}
              >
                P
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  Pradyut Patnaik
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    opacity: 0.8,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Log out
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
