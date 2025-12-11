import { createClient } from "@/app/db/create-server-client";

export async function POST (request: Request) {
  try {
    const { userId } = await request.json()
    
    const supabase = await createClient()
    const { error } = await supabase.from('players').delete().eq('id',  userId)
    if (error) return new Response('Error deleting user', {status: 500})

    return new Response('OK', {status: 200})
  }catch (error) {
    console.error(error)
    return new Response('Error', {status: 500})
  }
}