export type cardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type suit = "heart" | "spade" | "club" | "diamond";

export interface Card {
  number: cardNumber
  suit: suit
}

export interface player {
  cards: Card[];
  isFoldered: boolean;
}

