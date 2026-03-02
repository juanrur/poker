import { Game } from "../../domain/entities/Game";
import { GameRepository } from "../../domain/repositories/GameRepository";

export class Raise {
  constructor(private gameRepo: GameRepository) {}
  
  async execute(gameId: Game['id'], amount: number) {
    const game = await this.gameRepo.getGameById(gameId)
    if(!game) return
    game.raiseCurrentPlayer(amount)
    game.advanceTurn()
    await this.gameRepo.save(game)
  } 
}