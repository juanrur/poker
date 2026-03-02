'use client'

import { ReactNode, useContext, useEffect, useState } from "react";
import { createContext } from "react";

interface PlayerContextValue {
  player: Player | null;
  setPlayer: (player: Player | null) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export default function PlayerContextProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);

  return <PlayerContext.Provider value={{ setPlayer, player }}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerContextProvider");
  }
  return context;
}
