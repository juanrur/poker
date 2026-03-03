import { GameDTOMapper } from "@/modules/poker/application/mappers/GameDTOMapper";
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository";
import { NextRequest, NextResponse } from "next/server";

export async function GET (_: any, { params }: { params: Promise<{game_id: string}>}) {
  const {game_id: gameId} = await params 
  const gameRepository = new SupabaseGameRepository()
  const response = await gameRepository.getGameById(gameId)
  
  if(!response) return NextResponse.json(null, {status: 500})
  
  const game = GameDTOMapper.toDTO(response)

  return NextResponse.json(game, {status: 200})
}