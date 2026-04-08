import { generateText, tool } from 'ai'
import * as z from 'zod'
import {
  getBusinessInfo,
  getBusinessServices,
  getConversationHistory,
  getBusinessProducts,
  searchBusinessFAQs,
} from './conversation-tracker'
import { google } from '@ai-sdk/google'

const MODEL = google('gemini-2.5-flash')

interface AgentContext {
  businessId: string
  userPhone: string
  conversationHistory: any[]
}

/**
 * Create tools for product and FAQ lookups (DB-level filtering for scalability)
 */
function createBusinessTools(businessId: string) {
  return {
    searchProducts: tool({
      description: `Search for products in our catalog. Use this tool when:
- Customer asks about products, prices, or availability
- Customer mentions a product name or category
- Customer wants to know what items you have
Do NOT use this for general business questions.`,
      inputSchema: z.object({
        query: z.string().describe('Product name, category, or feature to search for'),
      }),
      execute: async ({ query }: { query: string }) => {
        try {
          const products = await getBusinessProducts(businessId, query)

          // Handle empty results with clear signal
          if (!products || products.length === 0) {
            return {
              results: [],
              message: 'No matching products found',
            }
          }

          return {
            results: products.map((p: any) => ({
              title: p.title,
              price: `$${p.price}`,
              category: p.category || 'Uncategorized',
              description: p.description,
              availability: p.stock_quantity > 0 ? 'In stock' : 'Out of stock',
            })),
            message: `Found ${products.length} product(s)`,
          }
        } catch (error) {
          console.error('[v0] Error searching products:', error)
          return {
            results: [],
            message: 'Error searching products. Please try again.',
          }
        }
      },
    }),
    getFAQAnswer: tool({
      description: `Search our FAQ database for answers. Use this tool when:
- Customer asks common questions about policies, shipping, returns
- Customer asks "how do I...", "what is...", "do you..."
- You need accurate information beyond your knowledge
Do NOT guess answers - always use this tool.`,
      inputSchema: z.object({
        topic: z.string().describe('FAQ topic or question keyword to search for'),
      }),
      execute: async ({ topic }: { topic: string }) => {
        try {
          const faqs = await searchBusinessFAQs(businessId, topic)

          // Handle empty results with clear signal
          if (!faqs || faqs.length === 0) {
            return {
              results: [],
              message: 'No matching FAQ found',
            }
          }

          return {
            results: faqs.map((f: any) => ({
              question: f.question,
              answer: f.answer,
            })),
            message: `Found ${faqs.length} matching FAQ(s)`,
          }
        } catch (error) {
          console.error('[v0] Error fetching FAQs:', error)
          return {
            results: [],
            message: 'Error fetching FAQs. Please try again.',
          }
        }
      },
    }),
  }
}

/**
 * Generate AI response based on business context and user query
 * Uses tools for dynamic content lookup when needed
 */
export async function generateBusinessResponse(
  query: string,
  context: AgentContext
): Promise<string> {
  try {
    console.log('[v0] Generating response for query:', query)

    // Fetch essential business context (minimal data)
    const [businessInfo, services] = await Promise.all([
      getBusinessInfo(context.businessId),
      getBusinessServices(context.businessId),
    ])

    if (!businessInfo) {
      console.error('[v0] Business not found:', context.businessId)
      return 'I apologize, but I could not retrieve your business information. Please try again later.'
    }

    // Build optimized system prompt (no products/FAQs included - fetched via tools)
    const systemPrompt = buildOptimizedSystemPrompt(businessInfo, services)

    // Build message history for context
    const messages = buildMessages(context.conversationHistory, query)

    console.log('[v0] System prompt length:', systemPrompt.length)
    console.log('[v0] Message history length:', messages.length)

    // Create tools for dynamic lookups
    const tools = createBusinessTools(context.businessId)

    // Generate response using GPT-4 with tool calling
    const result = await generateText({
      model: MODEL,
      system: systemPrompt,
      messages,
      tools,
      maxOutputTokens: 500,
      temperature: 0.7,
    })

    console.log('[v0] Generated response:', result.text.substring(0, 100))
    return result.text
  } catch (error) {
    console.error('[v0] Error generating response:', error)
    return 'I apologize for the inconvenience. Please try your question again.'
  }
}

/**
 * Optimized system prompt - minimal but instructive
 * Products/FAQs fetched dynamically via tools
 */
function buildOptimizedSystemPrompt(businessInfo: any, services: any[]): string {
  let prompt = `You are a helpful customer service assistant for ${businessInfo.name}.

Business: ${businessInfo.industry || 'Service provider'} - ${businessInfo.description || 'Supporting customers with quality service.'}
Contact: ${businessInfo.phone_number || 'Contact via website'} | Hours: ${businessInfo.opening_hours || 'Check website'}

`

  // Add services summary only if few
  if (services && services.length > 0 && services.length <= 5) {
    prompt += `Services: ${services.map((s: any) => s.name).join(', ')}\n\n`
  } else if (services && services.length > 5) {
    prompt += `Services: We offer multiple services. Ask about specific ones.\n\n`
  }

  prompt += `=== IMPORTANT: Tool Usage Rules ===
YOU MUST use tools when:
✓ Customer asks about products, prices, or availability → use searchProducts
✓ Customer asks common questions (policies, shipping, returns, etc.) → use getFAQAnswer
✓ You're unsure about details → DO NOT GUESS, use the appropriate tool

DO NOT:
✗ Make up product details or prices
✗ Guess at FAQ answers
✗ Ignore tool results even if unexpected

If a tool returns no results:
→ Politely tell customer: "We don't have that information available. Please contact us directly."
→ Do NOT make up an answer

=== Response Format ===
1. Be concise, professional, helpful (max 3 sentences)
2. Keep WhatsApp format simple (no fancy formatting)
3. If unsure about anything, suggest contacting directly or visiting website
4. Always respect this is a quick response channel
`

  return prompt
}

/**
 * Build message history for context (limit to last 5 messages)
 */
function buildMessages(conversationHistory: any[], newQuery: string) {
  const messages: any[] = []

  // Add only recent messages for context (last 5)
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.slice(-5).forEach((msg) => {
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
