// TODO: personalizar los tipos

export default function Card({ suit, number }: { suit: string; number: number; }) {
  const symbols = {
    heart: "❤️",
    diamond: "♦️",
    spade: "♠️",
    club: "♣️",
  };

  const numbers = {
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
    className="h-50 basis-34 flex-0 shrink-0 bg-white rounded-lg p-2 flex justify-between text-lg font-bold flex-col"
  >
    <span>{symbols[suit]}{numbers[number]}</span>
    <div className="flex flex-wrap items-center justify-center flex-1 content-center gap-y-1">
      {Array.from({ length: number }, (_, i) => (
        <div key={i} className="text-lg leading-none">{symbols[suit]}</div>
      ))}
    </div>
    <span className="self-end">{symbols[suit]} {numbers[number]}</span>
  </article>;
}