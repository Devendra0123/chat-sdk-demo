import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      industry,
      description,
      phone_number,
      email,
      website,
      opening_hours,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name,
        industry,
        description,
        phone_number,
        email,
        website,
        opening_hours,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
