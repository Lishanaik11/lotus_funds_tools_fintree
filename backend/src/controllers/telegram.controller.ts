import axios from "axios";
import { Request, Response } from "express";
import { pool } from "../db";

/* TELEGRAM BOT TOKEN */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/* FUNCTION TO SEND MESSAGE */

async function sendMessage(chatId: string | number, message: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Telegram API Error:", error?.response?.data || error?.message);
    throw error;
  }
}

/* FORMAT MESSAGE */

type RecommendationPayload = {
  ra_user_id: number | string;
  action: string;
  symbol: string;
  callType: string;
  tradeType: string;
  entry: number | string;
  target: number | string;
  stopLoss: number | string;
  rationale: string;
  holding: string;
};

function formatRecommendationMessage(data: RecommendationPayload) {
  return `
📊 New Recommendation

Action: ${data.action}
Symbol: ${data.symbol}
Type: ${data.callType}
Trade: ${data.tradeType}

Entry: ${data.entry}
Target: ${data.target}
Stop Loss: ${data.stopLoss}

Rationale: ${data.rationale}
Holding: ${data.holding}

#StockMarket #Trading
`;
}

/* MAIN CONTROLLER */

export const sendTelegram = async (req: Request, res: Response) => {
  try {
    const data = req.body as RecommendationPayload;

    console.log("📥 Incoming Data:", data);

    if (!BOT_TOKEN) {
      return res.status(500).json({
        error: "TELEGRAM_BOT_TOKEN is missing in environment",
      });
    }

    if (!data?.ra_user_id) {
      return res.status(400).json({
        error: "ra_user_id is required",
      });
    }

    /* FORMAT MESSAGE */
    const message = formatRecommendationMessage(data);

    /* 1️⃣ SAVE MESSAGE */

    await pool.query(
      `INSERT INTO telegram_messages
      (ra_user_id, message_text, action, symbol, call_type, trade_type, entry_price, target_price, stop_loss, rationale, holding_period)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        data.ra_user_id,
        message,
        data.action,
        data.symbol,
        data.callType,
        data.tradeType,
        data.entry,
        data.target,
        data.stopLoss,
        data.rationale,
        data.holding,
      ]
    );

    console.log("✅ Message saved to DB");

    /* 2️⃣ GET TELEGRAM USERS */

    const users = await pool.query(
      "SELECT telegram_user_id FROM telegram_users WHERE user_id = $1",
      [data.ra_user_id]
    );

    console.log("👥 Users from DB:", users.rows);

    const chatIds = users.rows.map((user: { telegram_user_id: string | number }) => user.telegram_user_id);

    if (chatIds.length === 0) {
      return res.status(400).json({
        error: "No Telegram users found for this user_id",
      });
    }

    /* 3️⃣ SEND MESSAGE */

    const failedChatIds: Array<string | number> = [];
    for (const id of chatIds) {
      try {
        const result = await sendMessage(id, message);
        console.log("✅ Sent to:", id, result);
      } catch (err) {
        failedChatIds.push(id);
        console.error("❌ Failed for:", id, err);
      }
    }

    if (failedChatIds.length === chatIds.length) {
      return res.status(502).json({
        error: "Telegram API rejected all recipients",
        failedChatIds,
      });
    }

    return res.json({
      success: true,
      message: "Telegram message sent",
      sentCount: chatIds.length - failedChatIds.length,
      failedCount: failedChatIds.length,
      failedChatIds,
    });

  } catch (err) {
    console.error("🔥 Server Error:", err);

    return res.status(500).json({
      error: "Failed to send telegram message",
    });
  }
};