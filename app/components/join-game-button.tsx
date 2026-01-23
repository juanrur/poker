'use client'
import { useEffect, useState, useRef } from "react";
import { createClient } from "../db/create-client-client"
import { redirect } from "next/navigation";

export default function JoinGameButton() {
  const supabase = createClient()
  const [userID, setUserID] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  
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

  async function handleJoinGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const gameId = formData.get("gameId") as string;
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
      <button onClick={() => dialog.current?.showModal()}>Join a game</button>
      <dialog 
      ref={dialog} 
      closedby="any" 
      className="mx-auto top-32 w-[80%] max-w-[700px] p-6 rounded-lg shadow-lg">
        <form 
        className="flex flex-col"
        onSubmit={handleJoinGame}>
          <label htmlFor="gameId">Insert Game ID:</label>
          <input type="text" name="gameId" id="gameId" className="border"></input>
        </form>
      </dialog>
    </>
  )
}