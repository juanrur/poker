import { Call } from "@/modules/poker/application/use-cases/Call"
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository"
import { Fold } from "@/modules/poker/application/use-cases/Fold"
import { Check } from "@/modules/poker/application/use-cases/Check"
import { Raise } from "@/modules/poker/application/use-cases/Raise"
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextResponse } from "next/server"
import { GameDTOMapper } from "@/modules/poker/application/mappers/GameDTOMapper"
import { GameDTO } from "@/modules/poker/application/use-cases/dtos/GameDTO"

type Type = 'call' | 'fold' | 'check' | 'raise'

export type ActionsDTO = {
  type: Type
  playerToken: string | null  
  amount?: number
}

export async function PUT (request: Request, { params }: { params: Promise<{game_id: string}>}) {
  const { game_id: gameId } = await params 
  const { type, amount, playerToken } = await request.json() as ActionsDTO

  const gameRepository = new SupabaseGameRepository()

  const token = playerToken

  if (!token) return new Response("Need token", { status: 401 })

  let payload

  try {
    payload = jwt.verify(token, process.env.SERVER_SECRET!) as JwtPayload
  } catch {
    return new Response("Invalid token", { status: 401 })
  }

  const playerId = payload.playerId

  const gameData = await gameRepository.getGameById(gameId)
  if(!gameData) return new Response("Game not found", { status: 404 })

  let game: GameDTO | null = GameDTOMapper.toDTO(gameData)

  if(playerId !== game?.currentTurnPlayer?.id) {
    return NextResponse.json('You have not the turn', { status: 401 })
  }

  const typeDictionary = {
    call: async () => {
      const call = new Call(gameRepository)
      game = await call.execute(gameId)
    },
    fold: async () => {
      const fold = new Fold(gameRepository)
      game = await fold.execute(gameId)
    }, 
    check: async () => {
      const check = new Check(gameRepository)
      game = await check.execute(gameId)
    },
    raise: async () => {
      const raise = new Raise(gameRepository)
      if(!amount) return NextResponse.json('Need some amount', {status: 400})
      game = await raise.execute(gameId, amount)
    }
  }

  if(!game) {
    return new Response("Error occurred while processing the request", { status: 500 })
  }

  await typeDictionary[type]()

  return NextResponse.json(game, { status: 200 })
}