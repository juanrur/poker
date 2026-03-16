import { Game } from "../../domain/entities/Game";
import { GameRepository } from "../../domain/repositories/GameRepository";
import { GameDTOMapper } from "../mappers/GameDTOMapper";
import { PlayerDTOMapper } from "../mappers/PlayerDTOMapper";

export class Check {
  constructor(private gameRepo: GameRepository) {}
  
  async execute(gameId: Game['id']) {
    const game = await this.gameRepo.getGameById(gameId)
    if(!game) return
    
    game.advanceTurn()
    
    if(game.shouldFinishGame()) game.finishGame()

    if (game.shouldAdvanceStreet()) game.advanceStreet()
      
    await this.gameRepo.save(game)
    
    return GameDTOMapper.toDTO(game)
  } 
}