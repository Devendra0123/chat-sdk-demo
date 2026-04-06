import { generateText } from 'ai'
import {
  getBusinessInfo,
  getBusinessFAQs,
  getBusinessServices,
  getConversationHistory,
} from './conversation-tracker'
import { google } from '@ai-sdk/google'
import { SupabaseClient } from '@supabase/supabase-js'

 const MODEL = google('gemini-2.5-flash')

interface AgentContext {
  businessId: string
  userPhone: string
  conversationHistory: any[]
}

/**
 * Generate AI response based on business context and user query
 */
export async function generateBusinessResponse(
  supabase: SupabaseClient,
  query: string,
  context: AgentContext
): Promise<string> {
  try {
    console.log('[v0] Generating response for query:', query)

    // Fetch business context
    const [businessInfo, faqs, services] = await Promise.all([
      getBusinessInfo(supabase,context.businessId),
      getBusinessFAQs(supabase, context.businessId),
      getBusinessServices(supabase, context.businessId),
    ])

    if (!businessInfo) {
      console.error('[v0] Business not found:', context.businessId)
      return 'I apologize, but I could not retrieve your business information. Please try again later.'
    }

    // Build system prompt with business context
    const systemPrompt = buildSystemPrompt(businessInfo, faqs, services)

    // Build message history for context
    const messages = buildMessages(context.conversationHistory, query)

    console.log('[v0] System prompt length:', systemPrompt.length)
    console.log('[v0] Message history length:', messages.length)

    // Generate response using GPT-4
    const result = await generateText({
      model: MODEL,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxOutputTokens: 500
    })

    console.log('[v0] Generated response:', result.text.substring(0, 100))
    return result.text
  } catch (error) {
    console.error('[v0] Error generating response:', error)
    return 'I apologize for the inconvenience. Please try your question again.'
  }
}

/**
 * Build system prompt with business context
 */
function buildSystemPrompt(
  businessInfo: any,
  faqs: any[],
  services: any[]
): string {
  let prompt = `You are a helpful customer service assistant for ${businessInfo.name}.

Business Information:
- Industry: ${businessInfo.industry || 'Not specified'}
- Description: ${businessInfo.description || 'Not provided'}
- Phone: ${businessInfo.phone_number || 'Not provided'}
- Email: ${businessInfo.email || 'Not provided'}
- Website: ${businessInfo.website || 'Not provided'}
- Hours: ${businessInfo.opening_hours || 'Not specified'}

`

  // Add services if available
  if (services && services.length > 0) {
    prompt += `Services & Products Offered:\n`
    services.forEach((service) => {
      prompt += `- ${service.name}: ${service.description || 'N/A'}\n`
    })
    prompt += '\n'
  }

  // Add FAQs if available
  if (faqs && faqs.length > 0) {
    prompt += `Frequently Asked Questions:\n`
    faqs.slice(0, 5).forEach((faq) => {
      prompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`
    })
  }

  prompt += `
Instructions:
1. You represent ${businessInfo.name}. Answer customer questions based on the business information provided above.
2. Be professional, friendly, and helpful.
3. If you don't know the answer, suggest the customer contact the business directly.
4. Keep responses concise and focused (max 2-3 sentences per response).
5. If the question is about services, refer to the services list above.
6. Always respect Meta's 24-hour message window policy - this is a response message to a customer inquiry.
7. Don't offer features or services not listed above.
`

  return prompt
}

/**
 * Build message history for context
 */
function buildMessages(conversationHistory: any[], newQuery: string) {
  const messages: any[] = []

  // Add up to 5 previous messages for context
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.slice(-10).forEach((msg) => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })
    })
  }

  // Add the current query
  messages.push({
    role: 'user',
    content: newQuery,
  })

  return messages
}

/**
 * Extract business ID from WhatsApp thread ID
 * Format: whatsapp:phoneNumberId:userWaId
 */
export function extractBusinessIdFromThread(threadId: string): string | null {
  const parts = threadId.split(':')
  // For now, we'll need the business ID passed separately
  // In production, you'd have a mapping of phone numbers to business IDs
  return null
}

/**
 * Format response for WhatsApp (max 4096 characters, split if needed)
 */
export function formatResponseForWhatsApp(text: string): string[] {
  const maxLength = 4096
  const responses: string[] = []

  if (text.length <= maxLength) {
    return [text]
  }

  // Split by sentences to maintain context
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  let currentMessage = ''

  for (const sentence of sentences) {
    if ((currentMessage + sentence).length > maxLength) {
      if (currentMessage) {
        responses.push(currentMessage.trim())
      }
      currentMessage = sentence
    } else {
      currentMessage += sentence
    }
  }

  if (currentMessage) {
    responses.push(currentMessage.trim())
  }

  return responses
}
