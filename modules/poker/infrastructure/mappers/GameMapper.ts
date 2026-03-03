import { Game } from "../../domain/entities/Game";
import { Player } from "../../domain/entities/Player";
import { RoundStates } from "../../domain/machines/RoundMachine";

// Types in database

// TODO: tocar la base de datos para que cuadre con estas interfaces
export interface GameRow {
  id: string; // uuid
  turn_player: string | null; // uuid
  actual_bet: number | null; // int8 (BigInt en JS, pero usualmente number)
  deck: any; // _jsonb (array de objetos)
  small_blind: number; // int4
  dealer: string | null; // uuid
  street: number | null; // int2
  cards: any; // jsonb
  has_incremented: boolean | null;
}

export interface PlayerRow {
  id: string; // uuid
  created_at: string; // timestamptz
  game: string | null; // uuid (Relación con games.id)
  bet: number | null; // int4
  money: number | null; // int4
  is_folded: boolean;
  cards: any; // jsonb
  name: string; // text
}

export class GameMapper {
  static toDomain(playerRows: PlayerRow[], gameRow: GameRow): Game {
    // id: string; // uuid
    const game = new Game(gameRow.id)
    game.players = playerRows.map(playerRow => {
      // id: string; // uuid
      // name: string; // text
      const player = new Player(playerRow.name, playerRow.id)
      // is_folded: boolean;
      player.isFolded = playerRow.is_folded
      // bet: number | null; // int4
      player.bet = playerRow.bet ?? 0
      // cards: any; // jsonb
      player.cards = playerRow.cards
      // money: number | null; // int4
      player.money = playerRow.money ?? 0
      // game: string | null; // uuid (Relación con games.id)
      player.gameID = playerRow.game

      return player
    })

    // turn_player: string | null; // uuid
    game.currentTurnPlayer = game.players.find(player => gameRow.turn_player === player.id) ?? null
    // actual_bet: number | null; // int8 (BigInt en JS, pero usualmente number)
    game.actualBet = gameRow.actual_bet ?? 0
    // deck: any; // _jsonb (array de objetos)
    game.deck = gameRow.deck
    // small_blind: number | null; // int4
    game.smallBlind = gameRow.small_blind
    // dealer: string | null; // uuid
    game.dealer = game.players.find(player => gameRow.dealer === player.id) ?? null
    // street: number | null; // int2
    game.street = gameRow.street ?? 0
    // cards: any; // jsonb
    game.cards = gameRow.cards
    // has_incremented: boolean | null;
    game.roundState = gameRow.has_incremented === true ? RoundStates.INCREASED : RoundStates.ACTIVE
    // TODO: game.pot
    return game
  }

  static toRow(game: Game): {gameRow: GameRow, playerRows: PlayerRow[]} {
    const gameRow: GameRow = {
      id: game.id,
      turn_player: game.currentTurnPlayer?.id ?? null,
      actual_bet: game.actualBet,
      deck: game.deck,
      small_blind: game.smallBlind,
      dealer: game.dealer?.id ?? null, // o game.dealer?.id
      street: game.street,
      cards: game.cards,
      has_incremented: game.roundState === RoundStates.INCREASED
    }   

    const playerRows: PlayerRow[] = game.players.map(p => ({
      id: p.id,
      name: p.name,
      bet: p.bet,
      money: p.money,
      cards: p.cards,
      is_folded: p.isFolded,
      game: p.gameID,
      // TODO: solucionar fecha inventada
      created_at: new Date().toISOString()
    }))

    return {gameRow, playerRows}
  }
}