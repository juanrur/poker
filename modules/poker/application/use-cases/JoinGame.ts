import { Game } from "../../domain/entities/Game";
import { Player } from "../../domain/entities/Player";
import { GameRepository } from "../../domain/repositories/GameRepository";

export class JoinGame {
  constructor(private gameRepo: GameRepository) {}
  
  async execute(gameCode: Game['joinCode'], playerId: Player['id']) {
    const game = await this.gameRepo.getGameByJoinCode(gameCode)
    const player = await this.gameRepo.getPlayerById(playerId)

    if(!game) throw new Error('Game not found')
    if(!player) throw new Error('Player not found')

    game.addPlayer(player)
    
    await this.gameRepo.save(game)
  } 
}