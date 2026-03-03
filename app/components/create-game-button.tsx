'use client'
import { redirect } from "next/navigation";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";

export default function CreateGameButton() {
  const { player } = usePlayer()

  async function handleCreateGame() {
    let newGameId

    fetch(`/api/games/create`, {
      method: 'POST',
      body: JSON.stringify({
        playerId: player?.id
      })
    })
    .then(res => res.json())
    .then(data => {
      newGameId = data.gameId
      redirect(`/game/${newGameId}`)
    })


  }

  return (
    <button onClick={handleCreateGame}>Create a game</button>
  )
}