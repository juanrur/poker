import { CreatePlayer } from "@/modules/poker/application/use-cases/CreatePlayer";
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers";
import { PlayerDTOMapper } from "@/modules/poker/application/mappers/PlayerDTOMapper";

export async function POST (request: NextRequest) {
  const { name } = await request.json()

  console.log("Supabase URL:", process.env.NEXT_PUBLIC_DB_PUBLISHABLE_KEY); 
  
  const gameRepository = new SupabaseGameRepository()

  const createPlayer = new CreatePlayer(gameRepository)
  const player = await createPlayer.execute(name)

  const token = jwt.sign(
    { playerId: player.id },
    process.env.SERVER_SECRET!,
    { expiresIn: "7d" }
  )

  return NextResponse.json({player: PlayerDTOMapper.toDTO(player), token}, { status: 200 })
}