import { Game } from "../../domain/entities/Game"
import { GameDTO } from "../use-cases/dtos/GameDTO"

export class GameDTOMapper {
   static toDTO({
    roundState, 
    players, 
    actualBet,    
    smallBlind,  
    currentTurnPlayer,  
    dealer, 
    street,    
    deck,
    cards,
    pot,    
    id, 
  }: Game): GameDTO {
    return {
      roundState, 
      players, 
      actualBet,    
      smallBlind,  
      currentTurnPlayer,  
      dealer, 
      street,    
      deck,
      cards,
      pot,    
      id
    }
  }

  static fromDTO({
    roundState, 
    players, 
    actualBet,    
    smallBlind,  
    currentTurnPlayer,  
    dealer, 
    street,    
    deck,
    cards,
    pot,    
    id
  }: GameDTO): Game {
    const game = new Game(id)
    game.roundState = roundState
    game.players = players
    game.actualBet = actualBet
    game.smallBlind = smallBlind
    game.currentTurnPlayer = currentTurnPlayer
    game.dealer = dealer
    game.street = street
    game.deck = deck
    game.cards = cards
    game.pot = pot
    return game
  }
}