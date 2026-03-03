import { Game } from "../../domain/entities/Game";
import { Player } from "../../domain/entities/Player";
import { GameRepository } from "../../domain/repositories/GameRepository";

export class LeaveGame {
  constructor(private gameRepo: GameRepository) {}

  async execute(gameId: Game['id'], playerId: Player['id']) {
    const game = await this.gameRepo.getGameById(gameId)
    const player = await this.gameRepo.getPlayerById(playerId)
    if(!game) return
    if(!player) return

    game.removePlayer(player)

    this.gameRepo.save(game)
  }
}