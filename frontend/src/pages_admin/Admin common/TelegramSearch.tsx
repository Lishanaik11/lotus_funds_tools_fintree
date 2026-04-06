import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper
} from '@mui/material';

import { Send as SendIcon } from '@mui/icons-material';
import { useState } from "react";
import axios from "axios";

type TelegramSearchProps = {
  onSaved?: (telegramUserId?: string) => void;
};

export const TelegramSearch = ({ onSaved }: TelegramSearchProps) => {

  const [username, setUsername] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSave = async () => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/telegram/save-user`, // ✅ CORRECT
      {
        telegram_user_id: telegramId,
        telegram_client_name: username,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("✅ Saved successfully");
    onSaved?.(telegramId);
  } catch (err: any) {
    alert("❌ Invalid Telegram ID or user didn't start bot");
  }
};
  return (
  <Box sx={{ p: 1, maxWidth: 1000 }}> {/* 👈 slightly wider */}
    <Paper
      elevation={0}
      sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, // 👈 3 in one row
          gap: 3,
        }}
      >
        {/* Telegram Username */}
        <TextField
          fullWidth
          label="Telegram Username"
          placeholder="@username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Telegram ID */}
        <TextField
          fullWidth
          label="Telegram ID"
          placeholder="123456789"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
        />

        {/* Phone Number */}
        <TextField
          fullWidth
          label="Phone Number"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        {/* Save Button */}
        <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            onClick={handleSave}
            sx={{
              backgroundColor: "#22C55E",
              "&:hover": { backgroundColor: "#1a9d4b" },
              textTransform: "none",
              px: 4,
              fontWeight: "600",
            }}
          >
            Save Details
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
);
};

export default TelegramSearch;