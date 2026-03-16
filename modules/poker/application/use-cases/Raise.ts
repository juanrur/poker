import { Game } from "../../domain/entities/Game";
import { GameRepository } from "../../domain/repositories/GameRepository";
import { GameDTOMapper } from "../mappers/GameDTOMapper";
import { GameDTO } from "./dtos/GameDTO";

export class Raise {
  constructor(private gameRepo: GameRepository) {}
  
  async execute(gameId: Game['id'], amount: number): Promise<GameDTO | null> {
    const game = await this.gameRepo.getGameById(gameId)
    if(!game) return null
    game.raiseCurrentPlayer(amount)
    game.advanceTurn()
    await this.gameRepo.save(game)
    
    return GameDTOMapper.toDTO(game)
  } 
}