import { Card } from "@/modules/poker/domain/entities/Card";
import { Player } from "@/modules/poker/domain/entities/Player";
import { RoundStates } from "@/modules/poker/domain/machines/RoundMachine";

export type GameDTO = {
  roundState: RoundStates
  players: Player[] ;
  actualBet: number   
  smallBlind: number 
  currentTurnPlayer: Player | null 
  dealer: Player | null
  street: number   
  deck: Card[]  
  cards: Card[]  
  pot: number   
  readonly id: string
  readonly joinCode: string
}