import { createClient } from "@/app/db/create-server-client";

export async function POST (request: Request) {
  try {
    const { userId } = await request.json()
    
    const supabase = await createClient()
    supabase.from('players').delete().eq('id',  userId)
    return new Response('OK', {status: 200})
  }catch (error) {
    console.error(error)
    return new Response('Error', {status: 500})
  }
}