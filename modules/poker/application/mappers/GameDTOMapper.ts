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
   
    // Map ALL players first
    game.players = players.map(p => PlayerDTOMapper.fromDTO(p));
    
    // SEARCH the exact references within the already created arrangement
    if (currentTurnPlayer) {
      game.currentTurnPlayer = game.players.find(
        player => player.id === currentTurnPlayer.id
      ) || null;
    }

    if (dealer) {
      game.dealer = game.players.find(
        player => player.id === dealer.id
      ) || null;
    }
    game.roundState = roundState
    game.actualBet = actualBet
    game.smallBlind = smallBlind
    game.street = street
    game.deck = deck
    game.cards = cards
    game.pot = pot
    return game
  }
}