import { Player } from "../../domain/entities/Player"
import { PlayerDTO } from "../use-cases/dtos/PlayerDTO"

export class PlayerDTOMapper {
   static toDTO({
    bet,
    money,
    cards,
    isFolded,
    gameID,
    name,
    id
  }: Player): PlayerDTO {
    return {
      bet,
      money,
      cards,
      isFolded,
      gameID,
      name,
      id
    }
  }

  static fromDTO({
    bet,
    money,
    cards,
    isFolded,
    gameID,
    name,
    id
  }: PlayerDTO): Player {
    const player = new Player(name, id)
    player.bet = bet
    player.money = money
    player.cards = cards
    player.isFolded = isFolded
    player.gameID = gameID
    return player
  }
}