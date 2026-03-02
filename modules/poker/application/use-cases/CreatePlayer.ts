import { Game } from "@/modules/poker/domain/entities/Game";
import { GameRepository } from "@/modules/poker/domain/repositories/GameRepository";
import { Player } from "../../domain/entities/Player";

export class CreatePlayer {
  constructor(private gameRepo: GameRepository) {}

  async execute(playerName: string): Promise<Player> {
    const player = new Player(playerName)    
    await this.gameRepo.savePlayer(player);

    return player;
  }
}