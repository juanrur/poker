'use client'
import { createClient } from "../db/create-client-client"

export default function CreateGameButton() {
  async function handleCreateGame() {
    console.log("Creating a new game...")
    const supabase = await createClient()
    supabase.from('games').insert({})
  }

  return (
    <button onClick={handleCreateGame}>Create a game</button>
  )
}