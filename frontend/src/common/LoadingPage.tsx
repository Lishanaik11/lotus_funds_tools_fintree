
import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingProps = {
  title?: string;
  subtitle?: string;
  size?: number;
  fullScreen?: boolean; // 🔥 new
};

export default function LoadingPage({
  title = "Loading",
  subtitle = "Please wait while we prepare your page.",
  size = 52,
  fullScreen = true,
}: LoadingProps) {
  return (
    <Box
      sx={{
        minHeight: fullScreen ? "100vh" : "200px", // 🔥 flexible height
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: fullScreen ? "background.default" : "transparent",
        px: 2,
        py: 2,
      }}
    >
      {/* Top spacer */}
      <Box />

      {/* Center Spinner */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <CircularProgress size={size} thickness={4} />
      </Box>

      {/* Bottom Text */}
      <Box
        sx={{
          textAlign: "center",
          px: 1,
        }}
      >
        <Typography
          variant="h6"
          color="text.primary"
          sx={{
            fontSize: {
              xs: "1rem",
              sm: "1.25rem",
            },
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: {
              xs: "0.8rem",
              sm: "0.9rem",
            },
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
