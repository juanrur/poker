import CreateGameButton from '../components/create-game-button'
import JoinGameButton from '../components/join-game-button'

export default async function Home () {
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-10">
      <h1>Poker</h1>
      <JoinGameButton />
      <CreateGameButton />
    </main>
  ) 
}