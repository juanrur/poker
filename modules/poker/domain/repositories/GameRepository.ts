import { Game } from "../entities/Game";
import { Player } from "../entities/Player";

export interface GameRepository {
  getGameById(gameId: Game['id']): Promise<Game | null>
  getPlayerById(playerId: Player['id']): Promise<Player | null>
  save(game: Game): Promise<Game | null>
  savePlayer(player: Player): Promise<Player | null>
}