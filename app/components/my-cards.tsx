import { Card } from "@/app/types";

export default function MyCards({ cards }: { cards: Card[] }) {
  return (
    <div className="flex gap-4">
      {cards.map((card, index) => (
        <div key={index} className="border p-4 rounded">
          <p>{card.number} of {card.suit}</p>
        </div>
      ))}
    </div>
  );
}