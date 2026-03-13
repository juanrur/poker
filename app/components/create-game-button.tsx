'use client'
import { redirect } from "next/navigation";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";

export default function CreateGameButton() {
  const { player } = usePlayer()

  async function handleCreateGame() {
    fetch(`/api/games/create`, {
      method: 'POST',
      body: JSON.stringify({
        playerId: player?.id
      })
    })
    .then(res => res.json())
    .then(data => {
      const joinCode = data.joinCode
      redirect(`/game/${joinCode}`)
    })


  }

  return (
    <button onClick={handleCreateGame}>Create a game</button>
  )
}