import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

/**
 * Gemini AI Agent Configuration
 * Uses Google's Gemini 2.5 Flash model (free tier)
 */

export const MODEL = google('gemini-2.5-flash')

export const SYSTEM_PROMPT = `You are a helpful WhatsApp assistant. 
You respond to user messages with concise, friendly, and practical answers.
Keep responses under 1000 characters for optimal WhatsApp display.
Be conversational and warm in your tone.`

/**
 * Generate a response using Gemini AI
 * @param userMessage - The incoming message from the user
 * @param conversationHistory - Optional array of previous messages for context
 */
export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Promise<string> {
  try {
    const messages = [
      ...conversationHistory,
      {
        role: 'user' as const,
        content: userMessage,
      },
    ]

    const result = await generateText({
      model: MODEL,
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.7,
      maxOutputTokens: 500
    })

    return result.text || 'I apologize, but I could not generate a response. Please try again.'
  } catch (error) {
    console.error('[v0] Error generating AI response:', error)
    return 'Sorry, I encountered an error processing your message. Please try again later.'
  }
}
