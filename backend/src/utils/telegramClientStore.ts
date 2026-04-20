import { TelegramClient } from "telegram";

const clientStore = new Map<number, TelegramClient>();

export const setClient = (userId: number, client: TelegramClient) => {
  clientStore.set(userId, client);
};

export const getClient = (userId: number) => {
  return clientStore.get(userId);
};

export const deleteClient = (userId: number) => {
  clientStore.delete(userId);
};