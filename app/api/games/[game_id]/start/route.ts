import { StartGame } from "@/modules/poker/application/use-cases/StartGame";
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository";
import { NextRequest, NextResponse } from "next/server";

export async function PUT (request: NextRequest, { params }: { params: Promise<{game_id: string}>}) {
  const {game_id: gameId} = await params
  const gameRepository = new SupabaseGameRepository()
  const start = new StartGame(gameRepository)

  await start.execute(gameId)
  return NextResponse.json(null, {status: 200})
}