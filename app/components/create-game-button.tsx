'use client'
import { createClient } from "../db/create-client-client"
import { v4 as uuid } from 'uuid';
import { redirect } from "next/navigation";
import { usePlayer } from "./player-context";

export default function CreateGameButton() {
  const supabase = createClient()

  const playerId = usePlayer().player?.id

  async function handleCreateGame() {
    console.log("Creating a new game...")
    const newGameID = uuid()
    await supabase.from('games').insert({id: newGameID})

    await supabase.from('players').update({ game: newGameID }).eq('id', playerId)

    redirect(`/game/${newGameID}`)
  }

  return (
    <button onClick={handleCreateGame}>Create a game</button>
  )
}