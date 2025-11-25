'use client';
import { useState } from "react";
import Actions from "./components/actions"
import Table from "./components/table";

export default function Home() {
  const [actualBet, setActualBet] = useState(50);
  const [yourBet, setYourBet] = useState(30);
  const [money, setMoney] = useState(1000);
  const [isFolded, setIsFolded] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(true);

  console.log(!isFolded, isMyTurn)
  return (
    <>
      <h1>ho</h1>
      <Table />
      {
        !isFolded && isMyTurn &&
        <Actions actualBet={actualBet} setActualBet={setActualBet} yourBet={yourBet} setYourBet={setYourBet} money={money} setMoney={setMoney}  />
      }
    </>
  );
}
