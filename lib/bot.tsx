/** @jsxImportSource chat */
import { Chat } from "chat";
import { createWhatsAppAdapter } from "@chat-adapter/whatsapp";
import { createRedisState } from "@chat-adapter/state-redis";
import {
  Actions,
  type AiMessage,
  Button,
  Card,
  CardLink,
  Divider,
  emoji,
  Field,
  Fields,
  LinkButton,
  Modal,
  RadioSelect,
  Section,
  Select,
  SelectOption,
  Table,
  CardText as Text,
  TextInput,
  toAiMessages,
} from "chat";

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
    // await thread.post("Hi Devendra, Good luck for this project");
    await thread.post(
      <Card
        subtitle={`Connected via ${thread.adapter.name}`}
        title={`${emoji.wave} Welcome!`}
      >
        <Text>I'm now listening to this thread. Try these actions:</Text>
        <Text>
          {`${emoji.sparkles} **Mention me with "AI"** to enable AI assistant mode`}
        </Text>
        <CardLink url="https://chat-sdk.dev/docs/cards">
          View documentation
        </CardLink>
        <Divider />
        <Divider />
        <Actions>
          <Button id="info">Show Info</Button>
          <Button id="choose_plan">Choose Plan</Button>
          <Button id="feedback">Send Feedback</Button>
        </Actions>
      </Card>
    );
  } else {
    await thread.post("Hello from Chat SDK test demo by Devendra. How can I help you?");
  }
});


bot.onSubscribedMessage(async (thread, message) => {
  await thread.post(`Devendra said: ${message.text}`);
});

bot.onAction("info", async (event) => {

  console.log("event trigerred!!!!")
  if (!event.thread) {
    return;
  }
  await event.thread.post(`${emoji.wave} Hello, ${event.user.fullName}!`);
});
