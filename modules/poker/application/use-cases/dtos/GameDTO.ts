import { Card } from "@/modules/poker/domain/entities/Card";
import { Player } from "@/modules/poker/domain/entities/Player";
import { RoundStates } from "@/modules/poker/domain/machines/RoundMachine";
import { PlayerDTO } from "./PlayerDTO";

export type GameDTO = {
  roundState: RoundStates
  players: PlayerDTO[] ;
  actualBet: number   
  smallBlind: number 
  currentTurnPlayer: PlayerDTO | null 
  dealer: PlayerDTO | null
  street: number   
  deck: Card[]  
  cards: Card[]  
  pot: number   
  readonly id: string
  readonly joinCode: string
}