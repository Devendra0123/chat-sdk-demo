import { Chat } from "chat";
import { createSlackAdapter } from "@chat-adapter/slack";
import { createRedisState } from "@chat-adapter/state-redis";
export const bot = new Chat({
  userName: "mybot",
  adapters: {
    slack: createSlackAdapter(),
  },
  state: createRedisState(),
});
// Respond when someone @mentions the bot
bot.onNewMention(async (thread) => {
  await thread.subscribe();
  await thread.post("Hello Devendra! I'm listening to this thread now.");
});

// Respond to follow-up messages in subscribed threads
bot.onSubscribedMessage(async (thread, message) => {
  await thread.post(`Devendra said: ${message.text}`);
});