'use client';
import { useEffect, useState } from "react";
import Actions from "@/app/components/actions"
import Table from "@/app/components/table";
import { Card, cardNumber, suit } from "@/app/types";
import MyCards from "@/app/components/my-cards";
import { useParams } from "next/navigation";
import { createClient } from "@/app/db/create-client-client";

export default function Home() {
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);

  const params = useParams();
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      try {
        const { data } = await supabase
          .from('games')
          .select('*')
          .eq('id', params.id)

        if (data && data.length > 0) setGame(data[0]);

      } catch (error) {
        console.error("Error fetching game data:", error);
      }

      const channels = supabase.channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'games' },
          (payload) => {
            setGame(payload.new);
          }
      )
      .subscribe()

      try {
        const { data } = await supabase
          .from('players')
          .select('*')
          .eq('game', params.id)

          console.log(data)

        if (data && data.length > 0) setPlayers(data);

      } catch (error) {
        console.error("Error fetching game data:", error);
      }
      
      const channelsPlayers = supabase.channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'players' },
          (payload) => {
            setGame(payload.new);
          }
      )
      .subscribe()
    }
    fetchData();
  }, [params]);
  
  const cardNumbers: cardNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const suits: suit[] = ["heart", "spade", "club", "diamond"];

  function getRandomCard() {
    const randomNumber = Math.floor(Math.random() * (13 - 1 + 1)) + 1;
    const randomSuit = Math.floor(Math.random() * (4 - 1 + 1)) + 1;

    return { number: cardNumbers[randomNumber - 1], suit: suits[randomSuit - 1] };
  }
  
  const [myCards, setMyCards] = useState<Card[]>([ getRandomCard(), getRandomCard() ]);

  return (
    <pre>
      <h1>game: {JSON.stringify(game)}</h1>
      <h1>players: {JSON.stringify(players)}</h1>
    </pre>

    // <main className="flex flex-col items-center justify-center min-h-screen py-2">
    //   <h1 className="h-20">Poker{JSON.stringify(params)}</h1>
    //   {/* <Table /> */}

    //   <MyCards cards={myCards}/>

    //   {
    //     !isFolded && isMyTurn &&
    //     <Actions actualBet={actualBet} setActualBet={setActualBet} yourBet={yourBet} setYourBet={setYourBet} money={money} setMoney={setMoney} setIsFolded={setIsFolded}  />
    //   }
    // </main>
  );
}
