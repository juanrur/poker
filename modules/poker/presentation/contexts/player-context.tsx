'use client'

import { ReactNode, useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { PlayerDTO } from "../../application/use-cases/dtos/PlayerDTO";

interface PlayerContextValue {
  player: PlayerDTO | null;
  playerToken: string | null
  setPlayer: (player: PlayerDTO | null) => void;
  setPlayerToken: (player: string | null) => void
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);

export default function PlayerContextProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerDTO | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null)

  return <PlayerContext.Provider value={{ setPlayer, player, playerToken, setPlayerToken }}>{children}</PlayerContext.Provider>;
}

