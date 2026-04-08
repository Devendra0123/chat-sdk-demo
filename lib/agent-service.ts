import { generateText, tool } from 'ai'
import { z } from 'zod'
import {
  getBusinessInfo,
  getBusinessFAQs,
  getBusinessServices,
  getConversationHistory,
  getBusinessProducts
} from './conversation-tracker'
import { google } from '@ai-sdk/google'
import { SupabaseClient } from '@supabase/supabase-js'

 const MODEL = google('gemini-2.5-flash')

//  function createAgentTools(businessId: string) {
//   return {
//     getProduct: tool({
//       description: 'Get details about a specific product by ID. Use this when a customer asks about product details, pricing, or availability.',
//       parameters: z.object({
//         productId: z.string().describe('The unique product ID'),
//       }),
//       execute: async ({ productId }: { productId: string }): Promise<any> => {
//         try {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${productId}`)
//           if (!response.ok) {
//             return { error: 'Product not found' }
//           }
//           const product = await response.json()
//           return {
//             id: product.id,
//             title: product.title,
//             description: product.description,
//             price: product.price,
//             category: product.category,
//             stock_quantity: product.stock_quantity,
//           }
//         } catch (error) {
//           console.error('[v0] Error fetching product:', error)
//           return { error: 'Unable to fetch product details' }
//         }
//       },
//     }),
//     listProducts: tool({
//       description: 'List all available products for this business. Use this when a customer asks what products are available.',
//       parameters: z.object({
//         category: z.string().optional().describe('Filter by product category'),
//       }),
//       execute: async ({ category }: { category?: string }): Promise<any> => {
//         try {
//           const products = await getBusinessProducts(businessId)
//           let filtered = products || []
//           if (category) {
//             filtered = filtered.filter((p: any) => p.category?.toLowerCase() === category.toLowerCase())
//           }
//           return filtered.map((p: any) => ({
//             id: p.id,
//             title: p.title,
//             price: p.price,
//             category: p.category,
//             stock_quantity: p.stock_quantity,
//           }))
//         } catch (error) {
//           console.error('[v0] Error listing products:', error)
//           return []
//         }
//       },
//     }),
//   }
// }

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
    const [businessInfo, faqs, services, products] = await Promise.all([
      getBusinessInfo(supabase,context.businessId),
      getBusinessFAQs(supabase, context.businessId),
      getBusinessServices(supabase, context.businessId),
      getBusinessProducts(context.businessId),
    ])

    if (!businessInfo) {
      console.error('[v0] Business not found:', context.businessId)
      return 'I apologize, but I could not retrieve your business information. Please try again later.'
    }

    // Build system prompt with business context
    const systemPrompt = buildSystemPrompt(businessInfo, faqs, services, products)

    // Build message history for context
    const messages = buildMessages(context.conversationHistory, query)

    console.log('[v0] System prompt length:', systemPrompt.length)
    console.log('[v0] Message history length:', messages.length)

    // Create agent tools
    // const tools = createAgentTools(context.businessId)

    // Generate response using GPT-4
    const result = await generateText({
      model: MODEL,
      system: systemPrompt,
      messages,
      // tools,
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
  services: any[],
  products: any[] = []
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

 // Add products if available
 if (products && products.length > 0) {
  prompt += `Available Products (${products.length} total):\n`
  products.slice(0, 10).forEach((product) => {
    prompt += `- ${product.title}: $${product.price} (ID: ${product.id})\n`
  })
  prompt += `Use the getProduct tool to fetch detailed information about specific products when customers ask.\n\n`
}

  // Add services if available
  if (services && services.length > 0) {
    prompt += `Services Offered:\n`
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
3. When customers ask about specific products, use the getProduct or listProducts tools to fetch accurate information.
4. If you don't know the answer, suggest the customer contact the business directly.
5. Keep responses concise and focused (max 2-3 sentences per response).
6. Always respect Meta's 24-hour message window policy - this is a response message to a customer inquiry.
7. Don't offer products or services not listed above.
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
