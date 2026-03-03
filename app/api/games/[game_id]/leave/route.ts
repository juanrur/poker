import { LeaveGame } from "@/modules/poker/application/use-cases/LeaveGame";
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{game_id: string}>}) {
  const {game_id: gameId} = await params

  const token = (await cookies()).get("playerToken")?.value
  
  if (!token) return new Response("Unauthorized", { status: 401 })

  let payload

  try {
    payload = jwt.verify(token, process.env.SERVER_SECRET!) as JwtPayload
  } catch {
    return new Response("Invalid token", { status: 401 })
  }

  const playerId = payload.playerId

  const gameRepository = new SupabaseGameRepository()
  const leaveGame = new LeaveGame(gameRepository)

  await leaveGame.execute(gameId, playerId)

  return NextResponse.json(null, { status: 200 })
}