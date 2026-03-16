import { Game } from "../../domain/entities/Game";
import { GameRepository } from "../../domain/repositories/GameRepository";
import { GameDTOMapper } from "../mappers/GameDTOMapper";

export class StartGame {
  constructor(private gameRepo: GameRepository) {}
  
  async execute(gameId: Game['id']) {
    const game = await this.gameRepo.getGameById(gameId)
    if(!game) return
    game.initializeDeck()
    game.dealCards()
    game.assignTurnAndDealer()
    game.postSmallAndBigBlind()
    await this.gameRepo.save(game)

    return GameDTOMapper.toDTO(game)
  } 
}