import { randomUUID } from "crypto";
import { Card } from "./Card";

export class Player {
  bet: number = 0
  money: number = 1000
  cards: Card[] = []
  isFolded: boolean = false
  gameID: string | null = null

  constructor( public readonly name: string, readonly id: string = randomUUID()){}
  
  
  receiveCards(cards: Card[]) {
    this.cards = cards;
  }

  placeBet(bet: number) {
    if (bet > this.money) {
      throw new Error("Not enough chips");
    }
    this.money -= bet;
    this.bet = bet
  }

  fold() {
    this.isFolded = true
  }

  joinGame(newGameID: string) {
    this.gameID = newGameID
  }
  
  leaveGame() {
    this.gameID = null
  }
}