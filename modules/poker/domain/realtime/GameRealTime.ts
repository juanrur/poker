import { GameDTO } from "../../application/use-cases/dtos/GameDTO"
import { Game } from "../entities/Game"

export interface GameRealTime {
  subscribeToGame(
    gameId: Game['id'],
    onGameUpdated: (game: GameDTO) => void
  ): any /*UnsubscribeFn*/

  subscribeToPlayers(
    gameId: Game['id'],
    onPlayerChanged: (event: any /*PlayerChangeEvent*/) => void
  ): any /*UnsubscribeFn*/
}