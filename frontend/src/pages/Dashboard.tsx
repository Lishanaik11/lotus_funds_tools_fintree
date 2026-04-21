import { useState, useEffect } from "react";
import { Typography, Paper, TextField, InputAdornment, Stack, Box, Button, Alert } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RecommendationHistory from "./common/RecommendationHistory";
import axios from "axios";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
    // Telegram state
  const [step, setStep] = useState<"phone" | "otp" | "connected">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

useEffect(() => {
  if (cooldown > 0) {
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [cooldown]);

useEffect(() => {
  const checkTelegram = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/api/telegram/status",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.connected) {
        setStep("connected"); // ✅ DON'T ASK AGAIN
      }
    } catch (err) {
      console.error(err);
    }
  };

  checkTelegram();
}, []);

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
    {/* =========================================================
     🔥 TELEGRAM CONNECT UI (REAL API)
     ========================================================= */}
<Box sx={{ mt: 4 }}>
  <Paper
    sx={{
      p: 3,
      border: "1px solid #E9E9EE",
      borderRadius: 2,
      boxShadow: "none"
    }}
  >
    <Typography variant="h6" fontWeight={600} mb={2}>
      Connect Telegram
    </Typography>

    {/* ERROR */}
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}

    {/* STEP 1: PHONE */}
    {step === "phone" && (
      <Stack spacing={2}>
        <TextField
          label="Phone Number"
          placeholder="+91XXXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />

        <Button
  variant="contained"
  disabled={loading || !phone || cooldown > 0}
  onClick={async () => {
    try {
      setLoading(true);
      setError("");

      if (!phone.startsWith("+")) {
        setError("Phone must include country code (+91...)");
        return;
      }

      const token = localStorage.getItem("token");

      await axios.post(
        import.meta.env.VITE_API_URL + "/api/telegram/send-otp",
        { phoneNumber: phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStep("otp");

      // 🔥 START COOLDOWN HERE
      setCooldown(30);

    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }}
>
  {cooldown > 0
    ? `Resend in ${cooldown}s`
    : loading
    ? "Sending OTP..."
    : "Send OTP"}
</Button>
      </Stack>
    )}

    {/* STEP 2: OTP */}
    {step === "otp" && (
      <Stack spacing={2}>
        <TextField
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          fullWidth
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            disabled={loading || otp.length < 4}
            onClick={async () => {
              try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                await axios.post(
                  import.meta.env.VITE_API_URL + "/api/telegram/verify-otp",
                  { code: otp },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                setStep("connected");

              } catch (err: any) {
                setError(err?.response?.data?.message || "OTP verification failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => setStep("phone")}
          >
            Change Number
          </Button>
        </Stack>
      </Stack>
    )}

    {/* STEP 3: CONNECTED */}
    {step === "connected" && (
      <Stack spacing={2}>
        <Alert severity="success">
          Telegram Connected Successfully
        </Alert>

        <Typography variant="body2">
          Connected Number:{" "}
          {phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2")}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => {
            setStep("phone");
            setPhone("");
            setOtp("");
          }}
        >
          Reconnect
        </Button>
      </Stack>
    )}
  </Paper>
</Box>
    </Paper>
  );
};

export default Dashboard;