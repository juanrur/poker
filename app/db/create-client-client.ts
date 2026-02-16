import { createBrowserClient as createSupabaseClient } from '@supabase/ssr';

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_DB_URL!, process.env.NEXT_PUBLIC_DB_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    } 
  )
}