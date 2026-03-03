import { CreateGame } from "@/modules/poker/application/use-cases/CreateGame";
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository";
import { NextRequest, NextResponse } from "next/server";

type CreateDTO = {
  playerId: string
}

export async function POST (request: NextRequest) {
  const { playerId } = await request.json() as CreateDTO

  const gameRepository = new SupabaseGameRepository()
  const createGame = new CreateGame(gameRepository)

  const game = await createGame.execute(playerId)

  if(!game) return NextResponse.json(null, {status: 500})

  return NextResponse.json({gameId: game.id}, {status: 200})

}