import { GameRepository } from "@/modules/poker/domain/repositories/GameRepository"
import { Game } from "../../domain/entities/Game";
import { createClient } from "@/app/db/create-server-client";
import { GameMapper } from "../mappers/GameMapper";
import { Player } from "../../domain/entities/Player";
import { PlayerMapper } from "../mappers/PlayerMapper";

export class SupabaseGameRepository implements GameRepository{

  private async getClient() {
    return await createClient()
  }

  async getGameById(gameId: Game["id"]): Promise<Game | null> {
    const supabase = await this.getClient()
    const { data: gameData } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()
    
    const { data: playersData } = await supabase
    .from('players')
    .select('*')
    .eq('game', gameId)

    if(!playersData) return null
    if(!gameData) return null
    
    return GameMapper.toDomain(playersData, gameData)
  }

  async getPlayerById(playerId: Player["id"]): Promise<Player | null> {
    const supabase = await this.getClient()
    const { data: playerData } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

    if(!playerData) return null

    return PlayerMapper.toDomain(playerData)
  }
  
  async save(game: Game):  Promise<Game | null>{
    const supabase = await this.getClient()
    const { gameRow, playerRows } = GameMapper.toRow(game)
   
    const { data: gameData, error: gameError } = await supabase.from('games').upsert(gameRow).select().single()
    
    if(!gameData) throw new Error(`Error saving the game: ${gameError?.message}`)
   
    const playersDataPromise = playerRows.map(async playerRow => {
      const { data: playerData, error: playerError } = await supabase.from('players').upsert(playerRow).select().single()
      if (!playerData) throw new Error(playerError?.message);
      return playerData
    })
    
    const playersData = await Promise.all(playersDataPromise)
    
    if (gameError) throw new Error(gameError.message);
    
    
    return GameMapper.toDomain(playersData, gameData)
  }

  async savePlayer(player: Player): Promise<Player | null> {
    const supabase = await this.getClient()
    const playerRow = PlayerMapper.toRow(player)
    const { data: playerData, error: playerError } = await supabase.from('players').upsert(playerRow).select().single()
    
    if (playerError) throw new Error(playerError.message);
    
    return PlayerMapper.toDomain(playerData)
  }
}