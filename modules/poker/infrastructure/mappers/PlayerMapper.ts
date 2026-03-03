import { Player } from "../../domain/entities/Player";

// Type in database
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

export class PlayerMapper {
  static toDomain(playerRow: PlayerRow): Player {
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

  }

  static toRow(player: Player): PlayerRow {
    return ({
      id: player.id,
      name: player.name,
      bet: player.bet,
      money: player.money,
      cards: player.cards,
      is_folded: player.isFolded,
      game: player.gameID,
      // TODO: solucionar fecha inventada
      created_at: new Date().toISOString()
    })
  }
}