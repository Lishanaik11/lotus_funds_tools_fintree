import { Request, Response } from "express";
//import { client } from "../telegramClient";
import { pool } from "../db";
import {AuthRequest} from "../middlewares/auth.middleware";
import { createClient } from "../utils/telegramClientFactory";
import { otpStore } from "../utils/telegramStore";
import { Api } from "telegram";

/**
 * Utility: sleep (for flood wait handling)
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe message sender (handles Telegram rate limits)
 */
// async function safeSendMessage(userId: any, message: string) {
//   try {
//     await client.sendMessage(userId, { message });
//     return { success: true };
//   } catch (err: any) {
//     console.error("Telegram Error:", err);

//     if (err.errorMessage?.includes("FLOOD_WAIT")) {
//       const seconds = parseInt(err.errorMessage.split("_").pop());
//       console.log(`⏳ Flood wait for ${seconds} seconds`);

//       await sleep(seconds * 1000);

//       // retry once
//       await client.sendMessage(userId, { message });
//       return { success: true, retried: true };
//     }

//     return { success: false, error: err.message };
//   }
// }

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // We use a string query because TelegramUser is just a TYPE for the result
    const result = await pool.query(
      "SELECT user_id, telegram_user_id, telegram_client_name, phone_number FROM telegram_users"
    );

    // result.rows will match your TelegramUser interface
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const saveTelegramUser = async (req: Request, res: Response) => {
  try {
    const { telegram_user_id, telegram_client_name, phone_number, user_id } = req.body;

    const query = `
INSERT INTO telegram_users (
  telegram_user_id,
  telegram_client_name,
  phone_number,
  user_id
)
VALUES ($1, $2, $3, $4)
ON CONFLICT (telegram_user_id)
DO UPDATE SET
  telegram_client_name = EXCLUDED.telegram_client_name,
  phone_number = EXCLUDED.phone_number,
  user_id = EXCLUDED.user_id
RETURNING *;
`;

    const values = [
  telegram_user_id,
  telegram_client_name,
  phone_number,
  user_id   // 👈 ADD THIS
];

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (error: any) {
    console.error("DATABASE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateParticipant = async (req: Request, res: Response) => {
  try {
    const { telegram_user_id } = req.params;
    const { telegram_client_name, phone_number } = req.body;

    // 1. Build the dynamic query to handle one or both fields
    const fields = [];
    const values = [];
    let queryCount = 1;

    if (telegram_client_name !== undefined) {
      fields.push(`telegram\_client\_name = $${queryCount++}`);
      values.push(telegram_client_name);
    }

    if (phone_number !== undefined) {
      fields.push(`phone\_number = $${queryCount++}`);
      values.push(phone_number);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // 2. Add the ID as the final parameter
    values.push(telegram_user_id);
    const queryText = `
      UPDATE telegram_users
      SET ${fields.join(", ")}
      WHERE telegram_user_id = $${queryCount}
      RETURNING *;
    `;

    const result = await pool.query(queryText, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({
      success: true,
      message: "Participant updated successfully",
      data: result.rows[0],
    });

  } catch (error: any) {
    console.error("UPDATE ERROR:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/telegram/participant/:telegram_user_id

export const deleteParticipant = async (req: Request, res: Response) => {
  try {
    const { telegram_user_id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM telegram_users
      WHERE telegram_user_id = $1
      RETURNING *;
      `,
      [telegram_user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error: any) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const getClientsByRA = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM telegram_users WHERE user_id = $1",
      [id]
    );

    res.json(result.rows);

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const sendMessageToRAClients = async (req: AuthRequest, res: Response) => {
  try {
    const raId = req.user!.id;
    const { message } = req.body;

    // get session
    const result = await pool.query(
      `SELECT telegram_session FROM users WHERE id = $1`,
      [raId]
    );

    const sessionString = result.rows[0]?.telegram_session;

    if (!sessionString) {
      return res.status(400).json({
        message: "Telegram not connected",
      });
    }

    const client = await createClient(sessionString);

    const users = await pool.query(
      `SELECT telegram_user_id FROM telegram_users WHERE user_id = $1`,
      [raId]
    );

    for (const u of users.rows) {
  try {
    const entity = await client.getEntity(u.telegram_user_id);

    await client.sendMessage(entity, {
      message,
    });

    await new Promise(res => setTimeout(res, 2000));

  } catch (err: any) {
    console.log("❌ Failed for user:", u.telegram_user_id, err.message);
  }
}

    return res.json({ success: true });

  } catch (err: any) {
    console.error("SEND MESSAGE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

import { setClient, getClient, deleteClient } from "../utils/telegramClientStore";

export const sendOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    const client = await createClient();

    const result: any = await client.sendCode(
      {
        apiId: Number(process.env.TELEGRAM_API_ID),
        apiHash: process.env.TELEGRAM_API_HASH!,
      },
      phoneNumber
    );

    // ✅ STORE CLIENT INSTANCE
    setClient(Number(req.user!.id), client);

    otpStore.set(Number(req.user!.id), {
  phoneCodeHash: result.phoneCodeHash,
  phoneNumber,
  expiresAt: Date.now() + 5 * 60 * 1000 // ✅ 5 minutes
});

    return res.json({ success: true });

  } catch (err: any) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const verifyOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    const data = otpStore.get(Number(req.user!.id));

    if (!data) {
      return res.status(400).json({ message: "OTP session expired" });
    }

    const client = getClient(Number(req.user!.id));

    if (!client) {
      return res.status(400).json({ message: "Session expired" });
    }

    const { Api } = await import("telegram");

    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: data.phoneNumber,
        phoneCode: code,
        phoneCodeHash: data.phoneCodeHash,
      })
    );

    const sessionString = client.session.save();

    await pool.query(
      `UPDATE users SET telegram_session = $1 WHERE id = $2`,
      [sessionString, req.user!.id]
    );

    deleteClient(Number(req.user!.id));
    otpStore.delete(Number(req.user!.id));

    return res.json({ success: true });

  } catch (err: any) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/telegram/status
export const getTelegramStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT telegram_session FROM users WHERE id = $1`,
      [req.user!.id]
    );

    const isConnected = !!result.rows[0]?.telegram_session;

    return res.json({ connected: isConnected });

  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
};