import { createClient } from "@/app/db/create-server-client";

export async function POST (request: Request) {
  console.log('Delete player request received')
  try {
    const { userId, nextPlayerId, gameId, isDealer } = await request.json()
    console.log('Delete player data:', { userId, nextPlayerId, gameId })
    
    const supabase = await createClient()
    if (nextPlayerId === userId) {
      const { error } = await supabase.from('games').delete().eq('id',  gameId)
      if (error) {
        console.log('Delete game result:', { error })
        return new Response('Error deleting game', {status: 500})
      }
      return new Response('OK', {status: 200}) 
    }

    if (isDealer) {
      const { error: nextError } = await supabase.from('games').update({ dealer: nextPlayerId }).eq('id',  gameId)
      console.log('Change dealer player result:', { nextError })
      if (nextError) return new Response('Error changing dealer player', {status: 500})
    }

    if (nextPlayerId === userId) {
      const { error: nextError } = await supabase.from('games').update({ turn_player: null }).eq('id',  gameId)
      console.log('Change turn player result:', { nextError })
      if (nextError) return new Response('Error changing turn player', {status: 500})
    }else {
      const { error: nextError } = await supabase.from('games').update({ turn_player: nextPlayerId }).eq('id',  gameId)
      console.log('Change turn player result:', { nextError })
      if (nextError) return new Response('Error changing turn player', {status: 500})
    }

    const { error } = await supabase.from('players').delete().eq('id',  userId)
    console.log('Delete player result:', { error })
    if (error) return new Response('Error deleting user', {status: 500})

    return new Response('OK', {status: 200})
  }catch (error) {
    console.error(error)
    return new Response('Error', {status: 500})
  }
}