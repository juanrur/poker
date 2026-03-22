'use client'
import { useState } from 'react'
import CreateGameButton from '../components/create-game-button'
import JoinGameButton from '../components/join-game-button'

export default function Home () {
  const [creatingGame, setCreatingGame] = useState<boolean>(false)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-10">
      <h1>Poker</h1>
      {creatingGame 
      ? <h1 className='font-bold text-2xl'>Creating game...</h1> 
      : <>
          <JoinGameButton />
          <CreateGameButton setCreatingGame={setCreatingGame}/>
        </>
    }
    </main>
  ) 
}