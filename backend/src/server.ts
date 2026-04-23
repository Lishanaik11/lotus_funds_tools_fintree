import "./config/env";
import app from "./app";

const PORT = process.env.PORT || 3000;
console.log("🔥 SERVER START FILE RUNNING");

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 🔥 THIS PREVENTS CLEAN EXIT
setInterval(() => {
  // keep event loop alive
}, 1000);