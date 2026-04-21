import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export const createClient = async (sessionString?: string) => {
  const stringSession = new StringSession(sessionString || "");

  const client = new TelegramClient(
    stringSession,
    Number(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH!,
    {
      connectionRetries: 5,
    }
  );

  await client.connect();

  return client;
};