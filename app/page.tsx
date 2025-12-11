import { createClient } from '@/app/db/create-server-client'
import { redirect } from 'next/navigation'
import CreateGameButton from './components/create-game-button'
import JoinGameButton from './components/join-game-button'

export default async function Home () {
  const supabase = await createClient()
  const { data: { session } } =  await supabase.auth.getSession()

  if (session === null) redirect('/login')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-10">
      <h1>Poker</h1>
      <JoinGameButton />
      <CreateGameButton />
    </main>
  ) 
}