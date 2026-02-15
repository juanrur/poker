'use client'

import { ReactNode, useContext, useEffect, useState } from "react";
import { createContext } from "react";

export type Player = {
  id: string; // uuid, PK
  // created_at: string; // timeStamp tz (ISO string)
  // game?: string | null; // uuid, nullable, FK -> games.id
  // bet?: number | null; // integer, nullable
  // money: number; // bigint mapped to string to preserve precision
  // is_folded: boolean; // boolean
  // cards?: object | null; // jsonb, nullable — usa un tipo más específico si tienes la forma del JSON
  // name: string; // text
};

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
