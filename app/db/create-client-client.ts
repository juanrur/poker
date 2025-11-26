import { createBrowserClient as createSupabaseClient } from '@supabase/ssr';

export function createClient() {
  return createSupabaseClient(
    "https://jqadyqbncdmehtgpyqbj.supabase.co", "sb_publishable_fwmwILtbQ36bm1ZF7zfCaw_GaW_XDBJ",
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    } 
  )
}