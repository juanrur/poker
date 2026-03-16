import { Game } from "../../domain/entities/Game";
import { Player } from "../../domain/entities/Player";
import { GameRepository } from "../../domain/repositories/GameRepository";
import { GameDTOMapper } from "../mappers/GameDTOMapper";
import { GameDTO } from "./dtos/GameDTO";

export class JoinGame {
  constructor(private gameRepo: GameRepository) {}
  
  async execute(gameCode: Game['joinCode'], playerId: Player['id']): Promise<GameDTO | null> {
    const game = await this.gameRepo.getGameByJoinCode(gameCode)
    const player = await this.gameRepo.getPlayerById(playerId)

    if(!game) return null
    if(!player) return null

    game.addPlayer(player)
    
    await this.gameRepo.save(game)

    return GameDTOMapper.toDTO(game)
  } 
}