import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from './supabase/service'

/**
 * Conversation Tracker Service
 * Manages 24-hour window compliance and conversation history
 */

export interface ConversationData {
  businessId: string
  userPhoneNumber: string
}

export interface MessageData {
  conversationId: string
  sender: 'user' | 'bot'
  content: string
  messageType?: string
}

/**
 * Get or create a conversation for a business and user
 */
export async function getOrCreateConversation(supabase: SupabaseClient,data: ConversationData) {
  // const supabase = await createClient()

  try {
    // Try to find existing conversation
    const { data: existing, error: selectError } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', data.businessId)
      .eq('user_phone_number', data.userPhoneNumber)
      .single()

    if (existing) {
      console.log('[v0] Found existing conversation:', existing.id)
      return existing
    }

    // Create new conversation
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        business_id: data.businessId,
        user_phone_number: data.userPhoneNumber,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) throw insertError

    console.log('[v0] Created new conversation:', newConversation.id)
    return newConversation
  } catch (error) {
    console.error('[v0] Error managing conversation:', error)
    throw error
  }
}

/**
 * Check if within 24-hour window for messaging
 */
export async function isWithin24HourWindow(conversationId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('last_message_at')
      .eq('id', conversationId)
      .single()

    if (error) throw error

    if (!conversation) {
      console.log('[v0] Conversation not found')
      return false
    }

    const lastMessageTime = new Date(conversation.last_message_at).getTime()
    const now = new Date().getTime()
    const hoursDiff = (now - lastMessageTime) / (1000 * 60 * 60)

    const within24Hours = hoursDiff < 24
    console.log(`[v0] Hours since last message: ${hoursDiff.toFixed(2)}, Within 24h: ${within24Hours}`)

    return within24Hours
  } catch (error) {
    console.error('[v0] Error checking 24-hour window:', error)
    return false
  }
}

/**
 * Save a message to conversation history
 */
export async function saveMessage(supabase: SupabaseClient,messageData: MessageData) {
  // const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversationId,
        sender: messageData.sender,
        content: messageData.content,
        message_type: messageData.messageType || 'text',
      })
      .select()
      .single()

    if (error) throw error

    console.log('[v0] Message saved:', data.id)
    return data
  } catch (error) {
    console.error('[v0] Error saving message:', error)
    throw error
  }
}

/**
 * Update last message timestamp (for 24-hour window tracking)
 */
export async function updateLastMessageTime(supabase: SupabaseClient,conversationId: string) {
  // const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single()

    if (error) throw error

    console.log('[v0] Updated last message time for conversation:', conversationId)
    return data
  } catch (error) {
    console.error('[v0] Error updating message time:', error)
    throw error
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 10
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    console.log(`[v0] Retrieved ${data.length} messages from conversation history`)
    return data.reverse() // Return in chronological order
  } catch (error) {
    console.error('[v0] Error fetching conversation history:', error)
    return []
  }
}

/**
 * Get business info for AI context
 */
export async function getBusinessInfo(supabase: SupabaseClient, businessId: string) {
  // const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (error) throw error

    console.log('[v0] Retrieved business info:', data.id)
    return data
  } catch (error) {
    console.error('[v0] Error fetching business info:', error)
    return null
  }
}

/**
 * Get FAQs for a business
 */
export async function getBusinessFAQs(supabase: SupabaseClient,businessId: string) {
  // const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`[v0] Retrieved ${data.length} FAQs`)
    return data
  } catch (error) {
    console.error('[v0] Error fetching FAQs:', error)
    return []
  }
}

/**
 * Get services for a business
 */
export async function getBusinessServices(supabase: SupabaseClient,businessId: string) {
  // const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`[v0] Retrieved ${data.length} services`)
    return data
  } catch (error) {
    console.error('[v0] Error fetching services:', error)
    return []
  }
}

/**
 * Get business ID by WhatsApp phone number ID
 * This matches the WhatsApp Business Account phone number ID to a business
 */
export async function getBusinessIdByPhoneNumber(supabase: SupabaseClient,phoneNumberId: string) {
  // const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('whatsapp_phone_number_id', phoneNumberId)
      .single()

    if (error) {
      console.error('[v0] Error fetching business by phone number:', error)
      return null
    }

    console.log('[v0] Found business:', data?.id)
    return data?.id || null
  } catch (error) {
    console.error('[v0] Unexpected error fetching business:', error)
    return null
  }
}

/**
 * Get products for a business
 */
export async function getBusinessProducts(businessId: string) {
  // const supabase = await createClient()

  const supabase = createServiceClient() 

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`[v0] Retrieved ${data.length} products`)
    return data
  } catch (error) {
    console.error('[v0] Error fetching products:', error)
    return []
  }
}