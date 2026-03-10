'use client';
import { useMemo } from "react";
import Actions from "@/app/components/actions"
import { redirect, useParams } from "next/navigation";
import Card from "@/app/components/card";
import Players from "@/app/components/players";
import { useGame } from "@/modules/poker/presentation/hooks/useGame";
import { usePlayer } from "@/modules/poker/presentation/hooks/usePlayer";

export default function Home() {
  const { id } = useParams() as {id: string}
  const { game, call, check, fold, raise, leave, start} = useGame(id)
  const { player } = usePlayer()
  if(!player) redirect('/')
  
  const myPlayer = game?.players.find(playerIn => playerIn.id === player.id)

  console.log(myPlayer)
 
  const isMyTurn = game?.currentTurnPlayer?.id === myPlayer?.id;

  function copyID () {
    navigator.clipboard.writeText(game!.id)
  }

  function moveToCenter (playerArray: any[], player: any) {
    const newPlayerArray = playerArray.filter((p: any) => p.id !== player.id);
    const leftPlayers = newPlayerArray.slice(0, Math.floor(newPlayerArray.length / 2));
    const rightPlayers = newPlayerArray.slice(Math.floor(newPlayerArray.length / 2));
    const newArray = [leftPlayers, [player], rightPlayers]
    return newArray;
  }

  const sortedPlayers = useMemo(() => {
    if(!game || !myPlayer) return []
    return moveToCenter(game.players, myPlayer);
  }, [game?.players, myPlayer]);

  if(game === null || !myPlayer) return <div>loading</div>

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <button 
        className="border border-white p-3 absolute top-2 left-2 rounded" 
        onClick={() => {
          leave()
          redirect('/play')
        }}
        >salir</button>
      {
        game &&
        <header>
          <h1 className="my-4">ID: {game.id}</h1>
          <button onClick={copyID}>copy</button>
          <div className="flex gap-2">
            {game.cards?.map((card, idx) => (
              <Card key={idx} suit={card.suit} number={card.value} />
            ))}
          </div>
          <span>
            {game.actualBet}
          </span>
        </header>
      }

      <Players players={sortedPlayers} game={game} myPlayer={myPlayer} />

      {
        !game.currentTurnPlayer && 
        <button onClick={start}>Start Game</button>
      }

      { myPlayer?.id && isMyTurn &&
        <Actions 
          raise={raise}
          check={check}
          call={call} 
          fold={fold} 
          canCheck={game.actualBet === myPlayer?.bet}
          maxRaise={myPlayer.money}
          minRaise={game.actualBet}
        />
      } 
      
      
    </main>
  );
}
