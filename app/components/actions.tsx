'use client'

import { useEffect, useState } from "react";

export default function Actions({
  raise,
  check,
  call, 
  fold,
  canCheck,
  minRaise,
  maxRaise
}: {
  raise: (amount: number) => void,
  check: () => void,
  call: () => void, 
  fold: () => void,
  minRaise: number,
  maxRaise: number,
  canCheck: boolean
}) {

  const [increment, setIncrement] = useState(
    minRaise * 2 < maxRaise 
    ? minRaise * 2 
    : minRaise + 20
  )
  const [incrementVisibility, setIncrementVisibility] = useState(false)

  return (
    <div className="flex gap-4">
      <button onClick={() => setIncrementVisibility(value => !value)}>Subir</button>
      {
       incrementVisibility &&
        <div className="grid grid-rows-2">
          <div>
            <input
              type="range"
              name="increment"
              onChange={(event) => setIncrement(Number(event.target.value))}
              defaultValue={increment}
              max={maxRaise}
              min={minRaise}/>
            <span>{increment}</span>
          </div>
          <button onClick={() => raise(increment)}>Raise</button>
        </div>
      }
      { !canCheck &&
        <button onClick={call}>Call</button>
      }
      { canCheck && 
        <button onClick={check}>Check</button>
      }
      <button onClick={fold}>Fold</button>
    </div>
  );
}
