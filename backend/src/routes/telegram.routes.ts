import express from "express";
import {
  sendTelegramMessage,
  sendBulkTelegramMessages,
  getAllUsers,
} from "../controllers/telegram.controller";

const router = express.Router();

/**
 * Send message to one user
 */
router.post("/send", sendTelegramMessage);

/**
 * Send bulk messages
 */
router.post("/send-bulk", sendBulkTelegramMessages);

router.get('/participants', getAllUsers);

export default router;