import { Router } from "express";
import { sendTelegram } from "../controllers/telegram.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/telegram/send", authenticate, sendTelegram);

export default router;
