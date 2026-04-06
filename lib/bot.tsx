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
import { generateAIResponse } from "./agent";
import { getBusinessIdByPhoneNumber, getOrCreateConversation, saveMessage, updateLastMessageTime } from "./conversation-tracker";
import { formatResponseForWhatsApp, generateBusinessResponse } from "./agent-service";

export const bot = new Chat({
  userName: "mybot",
  adapters: {
    whatsapp: createWhatsAppAdapter(),
  },
  state: createRedisState(),
});

// bot.onNewMention(async (thread, message) => {
//   console.log(message);
  
//   if (message.text === "hi") {
//     await thread.post(
//       <Card
//         subtitle={`Connected via ${thread.adapter.name}`}
//         title={`${emoji.wave} Welcome!`}
//       >
//         <Text>I'm now listening to this thread. Try these actions:</Text>
//         <Text>
//           {`${emoji.sparkles} **Mention me with "AI"** to enable AI assistant mode`}
//         </Text>
//         <CardLink url="https://chat-sdk.dev/docs/cards">
//           View documentation
//         </CardLink>
//         <Divider />
//         <Divider />
//         <Actions>
//           <Button id="info">Show Info</Button>
//           <Button id="choose_plan">Choose Plan</Button>
//           <Button id="feedback">Send Feedback</Button>
//         </Actions>
//       </Card>
//     );
//   } else {
//     const aiResponse = await generateAIResponse(message.text);
//     console.log(aiResponse, "AI-response 111222333")
//     await thread.post(aiResponse)
//   }
// });

bot.onNewMention(async (thread, message) => {
  try {
    console.log('[v0] New message from:', thread.id)
    console.log('[v0] Message text:', message.text)

    if (!message.text) {
      console.log('[v0] Skipping non-text message')
      return
    }

    // Extract phone number ID from thread (format: whatsapp:phoneNumberId:userWaId)
    const threadParts = thread.id.split(':')
    const phoneNumberId = threadParts[1]
    const userWaId = threadParts[2]

    console.log('[v0] Phone Number ID:', phoneNumberId)
    console.log('[v0] User WA ID:', userWaId)

    // Get business ID associated with this phone number
    const businessId = await getBusinessIdByPhoneNumber(phoneNumberId);

    console.log(businessId, "Business Id")
    if (!businessId) {
      console.error('[v0] Business not found for phone number:', phoneNumberId)
      await thread.post('Unable to process your message. Please contact support.')
      return
    }

    console.log('[v0] Business ID:', businessId)

    // Get or create conversation for this user
    const conversation = await getOrCreateConversation({
      businessId,
      userPhoneNumber: userWaId,
    })

    if (!conversation) {
      console.error('[v0] Failed to create/get conversation')
      await thread.post('Unable to process your message. Please try again.')
      return
    }

    console.log('[v0] Conversation ID:', conversation.id)

    // Save the incoming message
    await saveMessage({
      conversationId: conversation.id,
      sender: 'user',
      content: message.text,
      messageType: 'text',
    })

    // Update last message timestamp for 24-hour window tracking
    await updateLastMessageTime(conversation.id)

    // Generate AI response using the agent service
    const response = await generateBusinessResponse(message.text, {
      businessId,
      userPhone: userWaId,
      conversationHistory: [], // Will be populated by agent-service from DB
    })

    // Save the outgoing response
    await saveMessage({
      conversationId: conversation.id,
      sender: 'bot',
      content: response,
      messageType: 'text',
    })

    // Format response for WhatsApp (handles splitting if needed)
    const formattedResponses = formatResponseForWhatsApp(response)

    // Send responses to WhatsApp
    for (const resp of formattedResponses) {
      await thread.post(resp)
    }

    console.log('[v0] Response sent successfully')
  } catch (error) {
    console.error('[v0] Error processing message:', error)
    try {
      await thread.post('I apologize, but I encountered an error processing your message. Please try again.')
    } catch (sendError) {
      console.error('[v0] Failed to send error message:', sendError)
    }
  }
})

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
