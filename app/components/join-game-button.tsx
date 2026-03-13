'use client'
import { useRef } from "react";
import { redirect } from "next/navigation";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";
import { JoinDTO } from "../api/games/join/route";

export default function JoinGameButton() {
  const dialog = useRef<HTMLDialogElement>(null);

  const playerId = usePlayer().player?.id

  if(!playerId) redirect('/')

  async function handleJoinGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const gameId = formData.get("gameId") as string;

    const dto: JoinDTO = {
      playerId: playerId!
    } 
    fetch(`/api/games/${gameId}/join`, {
      method: 'PUT',
      body: JSON.stringify({
        playerId
      })
    })
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