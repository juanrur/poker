'use client'
import { redirect } from "next/navigation";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";
import { Dispatch, SetStateAction } from "react";

export default function CreateGameButton({ setCreatingGame }: {setCreatingGame: Dispatch<SetStateAction<boolean>>}) {
  const { player } = usePlayer()

  async function handleCreateGame() {
    setCreatingGame(true)
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