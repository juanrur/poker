import { Game } from "@/modules/poker/domain/entities/Game";
import { Player } from "@/modules/poker/domain/entities/Player";
import { GameRepository } from "@/modules/poker/domain/repositories/GameRepository";

export class CreateGame {
  constructor(private gameRepo: GameRepository) {}

  async execute(playerId: string): Promise<Game | null> {
    const game = new Game();
    const player = await this.gameRepo.getPlayerById(playerId)
    
    if(!player) return null
    
    game.addPlayer(player)

    await this.gameRepo.save(game);

    return game;
  }
}