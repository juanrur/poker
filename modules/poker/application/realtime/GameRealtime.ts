import { GameDTO } from "../use-cases/dtos/GameDTO";

export interface GameRealtime {
  subscribe(
    gameId: string,
    onUpdate: () => void
  ): () => void
}