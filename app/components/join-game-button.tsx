'use client'
import { useEffect, useState, useRef } from "react";
import { createClient } from "../db/create-client-client"
import { redirect } from "next/navigation";
import { usePlayer } from "./player-context";

export default function JoinGameButton() {
  const supabase = createClient()
  const dialog = useRef<HTMLDialogElement>(null);

  const playerID = usePlayer().player?.id

  async function handleJoinGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const gameId = formData.get("gameId") as string;

    await supabase.from('players').update({ game: gameId }).eq('id', playerID)
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