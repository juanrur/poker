'use client';
import { useState } from "react";
import Actions from "../components/actions"
import Table from "../components/table";
import { Card, cardNumber, suit } from "../types";
import MyCards from "../components/my-cards";

export default function Home() {
  const [actualBet, setActualBet] = useState(50);
  const [yourBet, setYourBet] = useState(30);
  const [money, setMoney] = useState(1000);
  const [isFolded, setIsFolded] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(true);

  const cardNumbers: cardNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const suits: suit[] = ["heart", "spade", "club", "diamond"];

  function getRandomCard() {
    const randomNumber = Math.floor(Math.random() * (13 - 1 + 1)) + 1;
    const randomSuit = Math.floor(Math.random() * (4 - 1 + 1)) + 1;

    return { number: cardNumbers[randomNumber - 1], suit: suits[randomSuit - 1] };
  }
  
  const [myCards, setMyCards] = useState<Card[]>([ getRandomCard(), getRandomCard() ]);
  
  
  console.log(!isFolded, isMyTurn)
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="h-20">Poker</h1>
      {/* <Table /> */}

      <MyCards cards={myCards}/>

      {
        !isFolded && isMyTurn &&
        <Actions actualBet={actualBet} setActualBet={setActualBet} yourBet={yourBet} setYourBet={setYourBet} money={money} setMoney={setMoney} setIsFolded={setIsFolded}  />
      }
    </main>
  );
}
