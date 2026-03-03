import { Call } from "@/modules/poker/application/use-cases/Call"
import { SupabaseGameRepository } from "@/modules/poker/infrastructure/repositories/SupabaseGameRepository"
import { Fold } from "@/modules/poker/application/use-cases/Fold"
import { Check } from "@/modules/poker/application/use-cases/Check"
import { Raise } from "@/modules/poker/application/use-cases/Raise"
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextResponse } from "next/server"

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

  const game = await gameRepository.getGameById(gameId)

  console.log({playerId, turn: game?.currentTurnPlayer?.id})

  if(playerId !== game?.currentTurnPlayer?.id) {
    return NextResponse.json('You have not the turn', { status: 401 })
  }

  const typeDictionary = {
    call: async () => {
      const call = new Call(gameRepository)
      await call.execute(gameId)
    },
    fold: async () => {
      const fold = new Fold(gameRepository)
      await fold.execute(gameId)
    }, 
    check: async () => {
      const check = new Check(gameRepository)
      await check.execute(gameId)
    },
    raise: async () => {
      const raise = new Raise(gameRepository)
      if(!amount) return NextResponse.json('Need some amount', {status: 400})
      await raise.execute(gameId, amount)
    }
  }

  await typeDictionary[type]()

  return NextResponse.json(null, { status: 200 })
}