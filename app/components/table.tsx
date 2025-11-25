'use client';
export default function Table() {
  type cardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  type suit = "heart" | "spade" | "club" | "diamond";
  interface card {
    number: cardNumber;
    suit: suit;
  }

  interface player {
    
    cards: card[];
  }

  // Array con todos los números posibles de cartas
  const cardNumbers: cardNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  // Array con todos los palos posibles
  const suits: suit[] = ["heart", "spade", "club", "diamond"];

  function getRandomCard() {
    const randomNumber = Math.floor(Math.random() * (13 - 1 + 1)) + 1;
    const randomSuit = Math.floor(Math.random() * (4 - 1 + 1)) + 1;

    return { number: cardNumbers[randomNumber - 1], suit: suits[randomSuit - 1] };
  }

  const players: player[] = [
    {
      cards: [getRandomCard(), getRandomCard(), getRandomCard()],
    },
    {
      cards: [getRandomCard(), getRandomCard(), getRandomCard()],
    },
    {
      cards: [getRandomCard(), getRandomCard(), getRandomCard()],
    },
  ]

  return (
    <ul className="flex flex-col gap-10">
      {players.map((player, index) => (
        <li key={index}>
          {player.cards.map((card, index) => (
            <div key={index}>
              {card.number} of {card.suit}
            </div>
          ))}
        </li>
      ))}
    </ul>
  )
}