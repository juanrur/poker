import { JoinGame } from "@/modules/poker/application/use-cases/JoinGame";
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository";
import { NextRequest, NextResponse } from "next/server";

export type JoinDTO = {
  playerId: string
}

export async function PUT (request: Request, { params }: { params: Promise<{game_id: string}>}) {
  const { game_id: gameId } = await params 
  const { playerId } = await request.json() as JoinDTO

  const gameRepository = new SupabaseGameRepository()
  const join = new JoinGame(gameRepository)
  await join.execute(gameId, playerId)

  return NextResponse.json(null, {status: 200})
}