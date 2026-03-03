import { useContext } from "react";
import {PlayerContext} from "../contexts/player-context";

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerContextProvider");
  }
  const {player, setPlayer, playerToken, setPlayerToken} = context

  async function createPlayer (name: string) {
    const res = await fetch(`/api/create-player`, {
      method: 'POST',
      body: JSON.stringify({
        name
      })
    })
    const {player, token} = await res.json() 
    
    setPlayer(player)
    setPlayerToken(token)
  }
  return {player, createPlayer, playerToken};
}