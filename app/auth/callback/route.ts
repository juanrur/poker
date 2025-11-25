import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/app/db/create-server-client'

import { NextResponse } from 'next/server'

export async function GET (request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  console.log('Code received:', code)
  try {
    if (code) {
      const supabase = await createClient()

      const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
      } else {
        console.log('Exchange result:', exchangeData)
      }

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session after exchange:', session)
    }
  } catch (error) {
    console.error('Error exchanging code for session:', error)
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 })
  }

  // If a session was created, return to origin; otherwise send user to login to avoid redirect loops
  try {
   const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      return NextResponse.redirect(requestUrl.origin)
    }
  } catch (err) {
    console.error('Error checking session after exchange:', err)
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
