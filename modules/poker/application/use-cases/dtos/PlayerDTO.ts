import { Card } from "@/modules/poker/domain/entities/Card"

export type PlayerDTO = {
  bet: number
  money: number
  cards: Card[]
  isFolded: boolean
  gameID: string | null
  readonly name: string
  readonly id: string
}