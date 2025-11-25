import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DB_URL;
const supabaseKey = process.env.DB_PUBLISHABLE_KEY;
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('supabaseUrl and supabaseKey are required.');
}

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey);
}