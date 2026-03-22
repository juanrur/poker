import { randomUUID } from "crypto";
import { Value, Suit } from "./Card";
import { Card } from "./Card";
import { Player } from "./Player";
import { RoundEvents, RoundStates, transition } from "../machines/RoundMachine";
import { evaluateHand } from "../services/HandEvaluator";
import { generateCode } from "../services/GameCodeGenerator";

export class Game {
  roundState: RoundStates = RoundStates.ACTIVE
  players: Player[] = [];
  actualBet: number = 0
  smallBlind: number = 20
  currentTurnPlayer: Player | null = null
  dealer: Player | null = null
  street: number = 0
  deck: Card[] = [] 
  cards: Card[] = [] 
  pot: number = 0
  
  constructor(readonly joinCode: string, readonly id: string){}

  addPlayer(player: Player) {
    this.players.push(player);
    player.joinGame(this.id)
  }

  removePlayer(player: Player) {
    this.players = this.players.filter(playerIn => playerIn !== player)
    player.leaveGame()
  }

  initializeDeck(){
    const cardNumbers: Value[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const suits: Suit[] = ["heart", "spade", "club", "diamond"];
    
    const newDeck = []
    for(let i=0; i<52; i++) {
      const card = { value: cardNumbers[i % 13], suit: suits[Math.floor(i / 13)] };
      newDeck.push(card);
    } 

    const shuffledDeck = [...newDeck].sort(() => Math.random() - 0.5);
     
    this.deck = shuffledDeck
  }

  dealCards() {
    // TODO: handle when the players exceed the max number
    this.players.forEach((player) => {
      const cardOne = this.deck.pop()
      const cardTwo = this.deck.pop()
      if(cardOne && cardTwo) {
        player.cards = [cardOne, cardTwo]
      }
    }) 
  }

  assignTurnAndDealer() {
    const dealerIndex = Math.floor(Math.random() * this.players.length)
    const turnPlayerIndex = (dealerIndex + 3) % this.players.length
    this.dealer = this.players[dealerIndex]
    this.currentTurnPlayer = this.players[turnPlayerIndex]
  }

  postSmallAndBigBlind() {
    const smallBlindIndex = (this.players.findIndex((player) => player.id === this.dealer?.id) + 1) % this.players.length
    const bigBlindIndex = (smallBlindIndex + 1) % this.players.length

    this.players[smallBlindIndex].placeBet(this.smallBlind)
    this.pot += this.smallBlind;
    this.actualBet = this.smallBlind;
    
    this.players[bigBlindIndex].placeBet(this.smallBlind * 2)
    this.pot += this.smallBlind * 2;
    this.actualBet = this.smallBlind * 2;
    this.roundState = transition(this.roundState, RoundEvents.RAISE);
  }

  advanceStreet() {
    this.street = this.street + 1
    
    let newCards : any = [] 
    if (this.street === 1) newCards = [this.deck.pop(), this.deck.pop(), this.deck.pop()]
    else newCards = [this.deck.pop()]

    if(newCards.length === 0) return
    if(newCards[0] === undefined) return

    const cards = this?.cards ?  [...this?.cards, ...newCards] : newCards

    this.cards =  cards
    this.currentTurnPlayer = this.players.find(({id}) => this.dealer?.id === id)!
    this.roundState = transition(this.roundState, RoundEvents.FINISHED_ROUND)
  }

  shouldAdvanceStreet() {
    return this.roundState === RoundStates.COMPLETE
  }
  
  resetForTheNextGame() {
    this.currentTurnPlayer = null
    for (const player of this.players) {
      player.bet= 0 
      player.isFolded= false
      player.cards = []
    }

    this.actualBet = 0
    this.street = 0
    this.cards = []
    this.deck = []
    this.dealer = null
  }

  advanceTurn(){
    const currentTurnPlayerIndex = this.players.findIndex(player => player.id === this.currentTurnPlayer?.id)
    
    let nextPlayerIndex
    let count = 1
    do {
      nextPlayerIndex = (currentTurnPlayerIndex + count) % this.players.length
      count++
    } while (this.players[nextPlayerIndex].isFolded === true)

    // Check is round is over
    if(this.players[nextPlayerIndex].id  === this.dealer?.id && this.roundState === RoundStates.ACTIVE) {
      this.roundState = transition(this.roundState, RoundEvents.ALL_PASSED)
    }
    
    if(this.roundState === RoundStates.INCREASED && this.players.every(player => (player.bet === this.actualBet || player.isFolded))) {
      this.roundState = transition(this.roundState, RoundEvents.ALL_EQUAL)
    }
    
    if(this.roundState === RoundStates.ACTIVE) {
      const dealerIndex = this.players.findIndex(({id}) => this.dealer?.id === id)
      const currentTurnPlayerIndex = this.players.findIndex(({id}) => this.currentTurnPlayer?.id === id)

      if(currentTurnPlayerIndex === (dealerIndex - 1 + this.players.length) % this.players.length){
        this.roundState = transition(this.roundState, RoundEvents.ALL_PASSED)
      }
    }

    this.currentTurnPlayer = this.players[nextPlayerIndex]
  }

  raiseCurrentPlayer(amount: number) {
    if (!this.currentTurnPlayer) throw new Error("No current player");
    
    this.currentTurnPlayer.placeBet(amount);
    
    this.pot += amount;
    this.actualBet = amount;
    this.roundState = transition(this.roundState, RoundEvents.RAISE);
  }

  foldCurrentPlayer() {
    this.currentTurnPlayer?.fold()
  }

  callCurrentPlayer() {
    this.currentTurnPlayer?.placeBet(this.actualBet)
    this.pot += this.currentTurnPlayer?.bet! - this.actualBet
  }

  shouldFinishGame() {
    const allPlayerAreFolded = this.players
    .filter(player => player.id !== this.currentTurnPlayer?.id)
    .every(player => player.isFolded)
    const gameIsOver = this.street === 3 && this.roundState === RoundStates.COMPLETE
    return gameIsOver || allPlayerAreFolded
  }

  finishGame(){
    let winner = this.players[0] 
    this.players.reduce(
      (preValue, player) => {
        const handValue = evaluateHand(player.cards, this.cards) 
        if(handValue > preValue) {
          winner = player
          return handValue
        }
        return preValue
      }, 
      0
    )

    winner.money += this.pot

    this.players.forEach(player => {
      player.bet = 0
      player.cards = []
      player.isFolded = false
    })

    this.roundState = RoundStates.ACTIVE
    this.actualBet = 0
    this.smallBlind = 20
    this.currentTurnPlayer = null
    this.dealer = null
    this.street = 0
    this.deck = [] 
    this.cards = [] 
    this.pot = 0
  }
}

