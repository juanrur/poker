import { Game } from "../../domain/entities/Game"
import { GameDTO } from "../use-cases/dtos/GameDTO"
import { PlayerDTOMapper } from "./PlayerDTOMapper"

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
    joinCode,
    id
  }: GameDTO): Game {
    const game = new Game(joinCode, id)
    game.roundState = roundState
    game.players = players.map(player => PlayerDTOMapper.fromDTO(player))
    game.actualBet = actualBet
    game.smallBlind = smallBlind
    game.currentTurnPlayer =  currentTurnPlayer ? PlayerDTOMapper.fromDTO(currentTurnPlayer) : null
    game.dealer = dealer ? PlayerDTOMapper.fromDTO(dealer) : null
    game.street = street
    game.deck = deck
    game.cards = cards
    game.pot = pot
    return game
  }
}