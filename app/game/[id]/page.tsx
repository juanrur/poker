'use client';
import { useEffect, useMemo, useState } from "react";
import Actions from "@/app/components/actions"
import Table from "@/app/components/table";
import { Card, cardNumber, suit } from "@/app/types";
import MyCards from "@/app/components/my-cards";
import { redirect, useParams } from "next/navigation";
import { createClient } from "@/app/db/create-client-client";
import router from "next/router";

export default function Home() {
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([])
  const supabase = createClient()
  const [user, setUser] = useState<any>() 
  
  const params = useParams();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data : {user} }) => setUser(user));
    let initialLoadDone = false;
      
    async function insertUserIntoGame() {
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
            setGame(payload.new);
          }
      )
      .subscribe()

      try {
        const { data } = await supabase
          .from('players')
          .select('*')
          .eq('game', params.id)
          .order('created_at', { ascending: true })

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
                const newPlayers = [...prevPlayers, payload.new]
                return newPlayers.sort()
              }
              if (payload.eventType === 'UPDATE'){
                return prevPlayers.map(player=> 
                  player.id === payload.new.id ? payload.new :  player
                );
              }
              if (payload.eventType === 'DELETE'){
                return prevPlayers.filter(player => player.id !== payload.old.id);
              }
            }); 
          }
      )
      .subscribe()

      return [channels, channelsPlayers]
    }
    
   

    let channelsPlayers: any
    let channelGame: any

    fetchData().then(([channelGameRespond, channelsPlayersRespond]) => { 
      channelGame = channelGameRespond
      channelsPlayers = channelsPlayersRespond
    });

    
    initialLoadDone = true
    return () => {
      if (channelGame) channelGame.unsubscribe()
      if (channelsPlayers) channelsPlayers.unsubscribe()
    }

  }, []);

  useEffect( () => {
    // close this window with whatever way - pc
    window.addEventListener('beforeunload', deletePlayer)
    // close this window with whatever way - mobile
    window.addEventListener('pagehide', deletePlayer);
    
    // change router.push to do delete player whenever you change the page (navegues)
    const originalPush = router.push;
    router.push = (...args: [url: URL, as?: URL | undefined, options?: any | undefined]) => {
      deletePlayer();
      return originalPush.apply(router, args);
    };

    return () => {
      window.removeEventListener('beforeunload', deletePlayer)
      window.removeEventListener('pagehide', deletePlayer)
      router.push = originalPush;
      deletePlayer()
    };
  }, [user])
  
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

  async function startGame() {
    // turn player
    const firstTurnPlayer = players[Math.floor(Math.random() * players.length)];
    await supabase.from('games').update({ turn_player: firstTurnPlayer.id }).eq('id', params.id).select();
    const index = players.findIndex(player => player.id === firstTurnPlayer.id)
    let count = index
    let dealer
    let small_blind
    let big_blind
    for (let i = 2; i >= 0 ; i--) {
      if(count === -1) count = players.length - 1
      if(i === 2) big_blind = players[count]
      if(i === 1) small_blind = players[count]
      if(i === 0) dealer = players[count] 

      count--
    }

    await supabase.from('players').update({ bet: game.small_blind }).eq('id', small_blind.id).select()
    await supabase.from('players').update({ bet: game.small_blind*2 }).eq('id', big_blind.id).select()
    await supabase.from('games').update({ actual_bet: game.small_blind*2 }).eq('id', params.id).select()
    
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

  const myPlayer = players.find(player => player.id === user.id);
  const isMyTurn = game?.turn_player === myPlayer?.id;

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // Si hay created_at, ordénalo por eso
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      // Si no, por id como fallback
      return a.id.localeCompare(b.id);
    });
  }, [players]);

  function deletePlayer () {
    fetch('/api/delete-player/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId: user?.id
      }),
      keepalive: true
    })
    .catch((error) => console.log(error))
  }

  async function setYourBet (bet: number) {
    await supabase.from('players').update({ bet: bet }).eq('id', myPlayer.id).select() 
  }

  async function setActualBet (bet: number) {
    await supabase.from('games').update({actual_bet: bet }).eq('id', params.id).select()
  }

  async function setIsFolded () {
    await supabase.from('players').update({is_folded: true}).eq('id', myPlayer.id).select()
    nextTurn()
  }

  async function nextTurn () {
    const myPlayerIndex = players.findIndex(player => player.id === myPlayer.id)
    const nextPlayer = players[myPlayerIndex + 1] ? players[myPlayerIndex + 1] : players[0] 
    console.log(nextPlayer.id)
    await supabase.from('games').update({turn_player: nextPlayer.id}).eq('id', params.id).select()
  }

  function copyID () {
    navigator.clipboard.writeText(game.id)
  }

  function handleGoOut () {
    deletePlayer()
    return redirect('/')
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <button className="border border-white p-3 absolute top-2 left-2 rounded" onClick={handleGoOut}>salir</button>
      {
        game &&
        <>
          <h1 className="my-4">ID: {game.id}</h1>
          <button onClick={copyID}>copy</button>
          <span>
            {game.actual_bet}
          </span>
        </>
      }
      
      {sortedPlayers &&
        sortedPlayers.map((player, idx) => (
          <div 
          key={player?.id || `player-${idx}-${Date.now()}`} 
          className="border p-4 m-2"> 
            <h2>Player {idx + 1}: {player.id}</h2>
            {
              player.cards &&
              <p>Cards: {player?.cards[0]?.number} of {player?.cards[0]?.suit}, {player?.cards[1]?.number} of {player?.cards[1]?.suit}</p>
            }
            <span>{JSON.stringify(player.bet)}</span>
            <p>{JSON.stringify(player.money)}</p>
          </div>
        ))
      }

      {
        !game?.turn_player && 
        <button onClick={startGame}>Iniciar juego</button>
      }
      
      {/* <Table /> */}

      {/* <MyCards cards={myCards}/> */}


      { !myPlayer?.is_folded && isMyTurn &&
        <Actions actualBet={game?.actual_bet}  yourBet={myPlayer?.bet}  money={myPlayer?.money} 
        setYourBet={setYourBet} setActualBet={setActualBet} setIsFolded={setIsFolded}  nextTurn={nextTurn}
        />
      } 
      
      
    </main>
  );
}
