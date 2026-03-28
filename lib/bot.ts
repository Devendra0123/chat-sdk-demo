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
  console.log(message);
  if (message.text === "hi") {
    await thread.post("Hi Devendra, Good luck for this project");
  } else {
    await thread.post("Hello from Chat SDK test demo by Devendra. How can I help you?");
  }
});


bot.onSubscribedMessage(async (thread, message) => {
  await thread.post(`Devendra said: ${message.text}`);
});