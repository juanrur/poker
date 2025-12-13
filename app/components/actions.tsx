'use client'

import { useEffect, useState } from "react";

export default function Actions({
  actualBet,
  yourBet,
  money,
  hasIncremented,
  setActualBet,
  setYourBet,
  setIsFolded,
  nextTurn
}: {
  user: any;
  hasIncremented: () => void;
  actualBet: number;
  yourBet: number;
  money: number;
  setActualBet: (bet: number) => void;
  setYourBet: (bet: number) => void;
  setIsFolded : (isFolded: boolean) => void;
  nextTurn: () => void
}) {

  const [increment, setIncrement] = useState(actualBet ? actualBet*2: 20)
  const [incrementVisibility, setIncrementVisibility] = useState(false)

  useEffect(() => {
    setIncrement(actualBet*2)
  }, [actualBet])

  const handleIncrementBet = () => {
    if (increment > money) return;
    setYourBet(increment);
    setActualBet(increment)
    hasIncremented()
    
    nextTurn()
  }

  const handlePass = () => {
    nextTurn()
  }
  
  const handleEqualize = () => {
    setYourBet(actualBet)
    nextTurn()
  }

  return (
    <div className="flex gap-4">
      <button onClick={() => setIncrementVisibility(value => !value)}>Subir</button>
      {
        actualBet && incrementVisibility &&
        <div className="grid grid-rows-2">
          <div>
            <input type="range" name="increment" onChange={(event) => setIncrement(Number(event.target.value))} defaultValue={increment} max={money} min={actualBet+20}/>
            <span>{increment}</span>
          </div>
          <button onClick={handleIncrementBet}>increment</button>
        </div>
      }
      {yourBet < actualBet &&
        <button onClick={handleEqualize}>Igualar</button>
      }
      { yourBet === actualBet && 
        <button onClick={handlePass}>Pasar</button>
      }
      <button onClick={() => setIsFolded(true)}>Foldear</button>
    </div>
  );
}
