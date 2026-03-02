export type Value = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Suit = "heart" | "spade" | "club" | "diamond";

export class Card {
  constructor(
    public readonly suit: Suit,
    public readonly value: Value 
  ) {}
}

