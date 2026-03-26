import { Chat } from "chat";
import { createWhatsAppAdapter } from "@chat-adapter/whatsapp";
import { createRedisState } from "@chat-adapter/state-redis";

export const bot = new Chat({
  userName: "mybot",
  adapters: {
    whatsapp: createWhatsAppAdapter(),
  },
  state: createRedisState(),
});

bot.onNewMention(async (thread, message) => {
  await thread.post("Hello from WhatsApp!");
});
