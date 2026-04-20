import express from "express";
import {
  getAllUsers,
  saveTelegramUser,
  updateParticipant,
  deleteParticipant,
  sendMessageToRAClients,
  sendOtp,
  verifyOtp,
  getTelegramStatus,
} from "../controllers/telegram.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { getClientsByRA } from "../controllers/telegram.controller";
const router = express.Router();

router.get('/participants', getAllUsers);
router.post('/save-user', saveTelegramUser);
router.put("/participant/:telegram_user_id", updateParticipant);
router.delete("/participant/:telegram_user_id", deleteParticipant);
router.post("/send-ra-message", authenticate, sendMessageToRAClients);
router.post("/send-otp", authenticate, sendOtp);
router.post("/verify-otp", authenticate, verifyOtp);
router.get("/ra/:id", authenticate, getClientsByRA);
router.get("/telegram/status", authenticate, getTelegramStatus);
export default router;

