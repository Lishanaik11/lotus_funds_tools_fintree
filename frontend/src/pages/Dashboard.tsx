import { useState } from "react";
import { Typography, Paper, TextField, InputAdornment, Stack, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RecommendationHistory from "./common/RecommendationHistory";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: "none", border: "1px solid #E9E9EE" }}>
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome to Fintree
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            This is your dashboard.
          </Typography>
        </Box>

        <TextField
          placeholder="Search symbols..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            width: { xs: "100%", sm: 300 },
            "& .MuiInputBase-root": { borderRadius: "8px", fontSize: "0.85rem" }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Passing searchQuery to the child component */}
      <RecommendationHistory searchQuery={searchQuery} />
    </Paper>
  );
};

export default Dashboard;