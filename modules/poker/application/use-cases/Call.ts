import { Game } from "../../domain/entities/Game"
import { GameRepository } from "../../domain/repositories/GameRepository"

export class Call {
  constructor(private gameRepo: GameRepository) {}
  
  async execute(gameId: Game['id']) {
    const game = await this.gameRepo.getGameById(gameId)
    if(!game) return
    game.callCurrentPlayer()
    
    game.advanceTurn()

    if(game.shouldFinishGame()) game.finishGame()
    
    if (game.shouldAdvanceStreet()) game.advanceStreet()
    
    await this.gameRepo.save(game)
  }
}