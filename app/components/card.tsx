import { suit as Suit, cardNumber } from "@/app/types";
export default function Card({ suit, number }: { suit: Suit; number: cardNumber; }) {
  const symbols = {
    heart: "❤️",
    diamond: "♦️",
    spade: "♠️",
    club: "♣️",
  };

  const numbers: { [key in cardNumber]: string } = {
    1: "A",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "J",
    12: "Q",
    13: "K",
  };

  return <article
    style={suit === "heart" || suit === "diamond" ? { color: "red" } : { color: "black" }}
    className="h-96 w-64 bg-white rounded-lg p-2 flex justify-between"
  >
    <span>{symbols[suit]} {numbers[number]}</span>
    <span className="self-end">{symbols[suit]} {numbers[number]}</span>
  </article>;
}