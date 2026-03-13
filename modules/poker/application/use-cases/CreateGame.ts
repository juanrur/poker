import { Game } from "@/modules/poker/domain/entities/Game";
import { GameRepository } from "@/modules/poker/domain/repositories/GameRepository";
import { generateCode } from "../../domain/services/GameCodeGenerator";

export class CreateGame {
  constructor(private gameRepo: GameRepository) {}

  async execute(playerId: string): Promise<Game | null> {
    
    // generate code that is not used
    let code
    while(true) {
      code = generateCode()
      const game = await this.gameRepo.getGameByJoinCode(code)
      if(!game) break
    }

    const game = new Game(code);
    const player = await this.gameRepo.getPlayerById(playerId)
    
    if(!player) return null
    
    game.addPlayer(player)

    await this.gameRepo.save(game);

    return game;
  }
}