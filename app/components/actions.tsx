export default function Actions({
  actualBet,
  yourBet,
  setActualBet,
  setYourBet,
  money,
  setMoney,
  setIsFolded
}: {
  actualBet: number;
  yourBet: number;
  money: number;
  setActualBet: (bet: number) => void;
  setYourBet: (bet: number) => void;
  setMoney: (money: number) => void;
  setIsFolded : (isFolded: boolean) => void;
}) {

  const handleIncrementBet = (increment: number) => {
    if (yourBet + increment > money) return;
    setYourBet(yourBet + increment);
    setMoney(money - increment);
  }

  return (
    <div className="flex gap-4">
      <button>Subir</button>
      {yourBet < actualBet && 
        <button>Pasar</button>
      }
      <button onClick={() => setIsFolded(true)}>Foldear</button>
    </div>
  );
}
