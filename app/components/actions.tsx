export default function Actions({ actualBet, yourBet, setActualBet, setYourBet, money, setMoney } : { actualBet: number; yourBet: number; setActualBet: (bet: number) => void; setYourBet: (bet: number) => void; money: number; setMoney: (money: number) => void }) {
  const handleIncrementBet = (increment: number) => {
    if (yourBet + increment > money) return
    setYourBet(yourBet + increment)
    setMoney(money - increment)
  }

  return (
    <div className="flex gap-4">
      <button>Subir</button>
      { yourBet < actualBet &&
        <button>Pasar</button>
      }
      <button>Foldear</button>
    </div>
  )
}