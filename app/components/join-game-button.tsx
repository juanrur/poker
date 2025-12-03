'use client'
import { useEffect, useState } from "react";
import { createClient } from "../db/create-client-client"
import { redirect } from "next/navigation";

export default function JoinGameButton() {
  const supabase = createClient()
  const [userID, setUserID] = useState<string | null>(null);
  const [gameID, setGameID] = useState<string>("");

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setGameID(event.target.value);
  }
  
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserID(session.user.id)
      } else {
        setUserID(null)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  if (!userID) {
    return <div>Please log in to join a game.</div>
  }

  async function handleJoinGame(gameId: string) {
    const { error: playerError } = await supabase.from('players').insert({ id: userID, game: gameId });
    if (playerError) {
      console.error("Error creando player:", playerError);
      alert(playerError.message);
      alert(userID) // Esto te mostrará el mensaje exacto
      return;
    }
    redirect(`/game/${gameId}`)
  }

  return (
    <>
      <button onClick={() => handleJoinGame(gameID)}>Join a game</button>
      <textarea name="gameId" id="gameId" onChange={handleChange}></textarea>
    </>
  )
}