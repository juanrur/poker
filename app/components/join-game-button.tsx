'use client'
import { useRef } from "react";
import { redirect } from "next/navigation";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";
import { JoinDTO } from "../api/games/join/[game_code]/route";

export default function JoinGameButton() {
  const dialog = useRef<HTMLDialogElement>(null);

  const playerId = usePlayer().player?.id

  if(!playerId) redirect('/')

  async function handleJoinGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const gameJoinCodeForm = formData.get("gameJoinCode") as string;
    const gameJoinCode = gameJoinCodeForm.toUpperCase().trim()

    if(!playerId) return
    
    const dto: JoinDTO = {
      playerId
    } 

    fetch(`/api/games/join/${gameJoinCode}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    })
    redirect(`/game/${gameJoinCode}`)
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
          <label htmlFor="gameId">Insert Game Code:</label>
          <input type="text" name="gameJoinCode" id="gameJoinCode" className="border"></input>
        </form>
      </dialog>
    </>
  )
}