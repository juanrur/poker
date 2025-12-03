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
  const [players, setPlayers] = useState<any[]>([])
  const supabase = createClient()

  const params = useParams();

  useEffect(() => {
    let initialLoadDone = false;
      
    async function insertUserIntoGame() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('id', user?.id)
        .eq('game', params.id)

      if (data !== null && data?.length > 0) return; // Ya está en la tabla players
      if (!user) return

      const { error: playerError } = await supabase.from('players').insert({ id: user.id, game: params.id })
      if (playerError) {
        console.error("Error creando player:", playerError)
        alert(playerError.message); // Esto te mostrará el mensaje exacto
        return
      }
    }
    insertUserIntoGame()

    async function fetchData() {
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
            console.log(payload)
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
      

      const channelsPlayers = supabase.channel('custom-all-channel2')
        .on(
          'postgres_changes',
           { 
            event: '*', 
            schema: 'public', 
            table: 'players',
            filter: `game=eq.${params.id}`  // ← FILTRAR POR JUEGO
          },
          (payload) => {
            setPlayers(prevPlayers => {
              if (payload.eventType === 'INSERT') {
                if (!initialLoadDone) return 
                const exists = prevPlayers.some(player => player.id === payload.new.id);
                if (exists) return prevPlayers; // No agregar si ya existe
                return[...prevPlayers, payload.new]
              }
              if (payload.eventType === 'UPDATE'){
                return prevPlayers.map(player=> 
                  player.id === payload.new.id ? payload.new :  player
                );
              }
            }); 
          }
      )
      .subscribe()
    }
    fetchData();

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const channel = supabase.channel('room-presence', {
        config: {
          presence: {
            key: user.id 
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach(async (user) => {
          console.log(`Usuario ${user.user_id} dejó la sala`);
          await supabase.from('players').delete().eq('id', user.user_id);
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            game_id: params.id
          })
          console.log('✅ Te has unido a la sala de presencia');
        }
    });

    return channel;
    };

    let channelObserver: any
    setupPresence().then((channel) => channelObserver = channel)

    initialLoadDone = true

    return () => {
      if (channelObserver) channelObserver.unsubscribe()
    }

  }, []);
  
  const cardNumbers: cardNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const suits: suit[] = ["heart", "spade", "club", "diamond"];

  const deck = [];

  for(let i=0; i<52; i++) {
    const card = { number: cardNumbers[i % 13], suit: suits[Math.floor(i / 13)] };
    deck.push(card);
  }

  function getRandomCard() {
    const randomNumber = Math.floor(Math.random() * (13 - 1 + 1)) + 1;
    const randomSuit = Math.floor(Math.random() * (4 - 1 + 1)) + 1;

    return { number: cardNumbers[randomNumber - 1], suit: suits[randomSuit - 1] };
  }
  
  const [myCards, setMyCards] = useState<Card[]>([ getRandomCard(), getRandomCard() ]);


  async function startGame() {
    // turn player
    const firstTurnPlayer = players[Math.floor(Math.random() * players.length)];
    await supabase.from('games').update({ turn_player: firstTurnPlayer.id }).eq('id', params.id).select();
    
    // shuffle deck
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    await supabase.from('games').update({ deck: shuffledDeck }).eq('id', params.id).select();

    // deal cards to players
    for (const player of players) {
      const playerCards = [shuffledDeck.pop(), shuffledDeck.pop()];
      await supabase.from('players').update({ cards: playerCards }).eq('id', player.id).select();
    }

    // update deck in game
    await supabase.from('games').update({ deck: shuffledDeck }).eq('id', params.id).select();
  }

  const myPlayer = players.find(player => player.id === supabase.auth.getUser().then(({ data: { user } }) => user?.id));

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="my-4">ID: {game.id}</h1>
      
      {players &&
        players.map((player, idx) => (
          <div 
          key={player?.id || `player-${idx}-${Date.now()}`} 
          className="border p-4 m-2"> 
            <h2>Player {idx + 1}: {player.id}</h2>
            <p>Cards: {JSON.stringify(player.cards)}</p>
          </div>
        ))
      }

      <button onClick={startGame}>Iniciar juego</button>
      {/* <Table /> */}

      {/* <MyCards cards={myCards}/> */}
{/* 
      { !isFolded && isMyTurn &&
        <Actions actualBet={actualBet} setActualBet={setActualBet} yourBet={yourBet} setYourBet={setYourBet} money={money} setMoney={setMoney} setIsFolded={setIsFolded}  />
      }
       */}
    </main>
  );
}
