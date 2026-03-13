import { GameDTOMapper } from "@/modules/poker/application/mappers/GameDTOMapper";
import { JoinGame } from "@/modules/poker/application/use-cases/JoinGame";
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository";
import { NextRequest, NextResponse } from "next/server";

export type JoinDTO = {
  playerId: string
}

export async function PUT (request: Request, { params }: { params: Promise<{game_code: string}>}) {
  const { game_code: gameCode } = await params 
  const { playerId } = await request.json() as JoinDTO
  console.log(gameCode, playerId)

  const gameRepository = new SupabaseGameRepository()
  const join = new JoinGame(gameRepository)
  await join.execute(gameCode, playerId)

  return NextResponse.json(null, {status: 200})
}

export async function GET (_: any, { params }: { params: Promise<{game_code: string}>}) {
  const {game_code: joinCode} = await params 
  const gameRepository = new SupabaseGameRepository()
  const response = await gameRepository.getGameByJoinCode(joinCode)
  
  if(!response) return NextResponse.json(null, {status: 500})
  
  const game = GameDTOMapper.toDTO(response)

  return NextResponse.json(game, {status: 200})
}