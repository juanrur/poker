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
    joinCode,
    id
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
      joinCode,
      id
    }
  }

  // TODO: no esta bien del to esto porque al game le hace falta el id porque ya tendría que estar definido
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
    joinCode
  }: GameDTO): Game {
    const game = new Game(joinCode)
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