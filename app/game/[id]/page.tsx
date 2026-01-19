'use client';
import { useEffect, useMemo, useRef, useState } from "react";
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
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>() 
  const initialLoadDone = useRef(false);
  const myPlayer = players.find(player => player.id === user.id)
  
  const cardNumbers: cardNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const suits: suit[] = ["heart", "spade", "club", "diamond"];
  const deck = [];

  for(let i=0; i<52; i++) {
    const card = { number: cardNumbers[i % 13], suit: suits[Math.floor(i / 13)] };
    deck.push(card);
  }
  
  const params = useParams();

  async function newStreet () {
    const newDeck = game.deck
    const shuffledNewDeck = [...newDeck].sort(() => Math.random() - 0.5)
    let newCards : any = []
    if (game.street === 0) newCards = [shuffledNewDeck.pop(), shuffledNewDeck.pop(), shuffledNewDeck.pop()]
    else newCards = [shuffledNewDeck.pop()]

    if(newCards.length === 0) return
    if(newCards[0] === undefined) return

    const cards = game?.cards ?  [...game?.cards, ...newCards] : newCards

    try { 
      await supabase.from('games').update({cards: cards}).eq('id', params.id).select()
      await supabase.from('games').update({deck: shuffledNewDeck}).eq('id', params.id).select()
      await supabase.from('games').update({turn_player: game.dealer}).eq('id', params.id).select()
      const actualStreet = game.street + 1
      await supabase.from('games').update({street: actualStreet}).eq('id', params.id).select()
      await supabase.from('games').update({has_incremented: false}).eq('id', params.id).select()
    
    } catch (error) {
      console.error("Error updating game for new street:", error);
    }
  }
  
  // New street effect
  useEffect(() => {
    console.log("turn player changed:", game?.turn_player)

    console.log({
      gameExists: !game,
      userExists: !user,
      deckExists: !game?.deck,
      turnIsUser: !game?.turn_player !== user?.id,
      // player === game o is_folded
      playersMatched: !players.every(player => player.bet === game?.actual_bet || player.is_folded),
      hasIncrementedOrDealer: !game?.has_incremented || game?.turn_player !== game?.dealer,
      overall: !!game && !!user && !!game?.deck && game?.turn_player === user?.id && players.every(player => player.bet === game?.bet || player.is_folded) && (game?.has_incremented || game?.turn_player === game?.dealer)
    })

    console.log({ players })
    
    if (!game) return
    if(!user) return
    if(!game?.deck) return 
    if(!game?.turn_player !== user?.id) return
    if(!players.every(player => player.bet === game.actual_bet || player.is_folded )) return
    if(!game.has_incremented && game.turn_player !== game.dealer) return
    
    console.log("new street triggered")
   

    newStreet()

    // se puede optimizar para cada vez que me toque a mi
  }, [game?.turn_player])
  
  // Insert user
  useEffect(() => {
    supabase.auth.getUser().then(({ data : {user} }) => {
      setUser(user)
      initialLoadDone. current = false
      
      insertUserIntoGame(user) 
    });
      
    async function insertUserIntoGame(user : any) {
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
  }, []);

  // Initial Load Effect
  useEffect(() => {
    if (!params?.id || typeof params.id !== 'string') return;

    const gameId = params.id;

    const initialLoad = async () => {
      // --- Cargar datos iniciales (FETCH) ---
      try {
        const { data: gameData } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();
        
        if (gameData) setGame(gameData);

        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('game', gameId)
          .order('created_at', { ascending: true });

        if (playersData) setPlayers(playersData);
      } catch (e) {
        console.error("Error fetching initial data", e);
      }
    };

    // Llamamos a la carga inicial
    initialLoad();
  }, [])

  // Channels Subscription
  useEffect(() => {
    if (!params?.id) return; // Protección si no hay ID todavía

    let gameChannel = supabase.channel(`games-${params.id}`);

    let playersChannel = supabase.channel(`players-${params.id}`);


    gameChannel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${params.id}` },
        (payload) => {
          setGame(payload.new);
        }
      )
      .subscribe((status, error) => {
        console.log("Subscribed to game channel", status, error);
      });

    // --- Suscripción a PLAYERS ---
    playersChannel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `game=eq.${params.id}` },
        (payload) => {
          console.log("Player change detected:", payload);
          // Tu lógica compleja de players aquí...
          // NOTA: Usa 'setPlayers' con la función callback para tener el estado más reciente
          setPlayers(prevPlayers => {
              if (payload.eventType === 'INSERT') {
                if (prevPlayers.some(p => p.id === payload.new.id)) return prevPlayers;
                return [...prevPlayers, payload.new].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              }
              if (payload.eventType === 'UPDATE') {
                return prevPlayers.map(p => p.id === payload.new.id ? payload.new : p);
              }
              if (payload.eventType === 'DELETE') {
                return prevPlayers.filter(p => p.id !== payload.old.id);
              }
              return prevPlayers;
          });
        }
      )
      .subscribe((status, error) => {
        console.log("Subscribed to players channel", status, error);
      });

    // --- LIMPIEZA CORRECTA ---
    return () => {
      // Al desmontar, eliminamos explícitamente los canales creados en este efecto
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);

    };

  }, [params.id, supabase]);
  
  // Delete player on unload or navigation
  useEffect( () => {
    const handleDeletePlayer = () => {
      console.log("borrando a: " + user.id)
      deletePlayer()
    }

    // close this window with whatever way - pc
    window.addEventListener('beforeunload', handleDeletePlayer)
    // close this window with whatever way - mobile
    window.addEventListener('pagehide', handleDeletePlayer);
    
    // change router.push to do delete player whenever you change the page (navegues)
    const originalPush = router.push;
    router.push = (...args: [url: URL, as?: URL | undefined, options?: any | undefined]) => {
      handleDeletePlayer();
      return originalPush.apply(router, args);
    };

    return () => {
      window.removeEventListener('beforeunload', handleDeletePlayer)
      window.removeEventListener('pagehide', handleDeletePlayer)
      router.push = originalPush;
    };
  }, [user])
  


  function getRandomCard() {
    const randomNumber = Math.floor(Math.random() * (13 - 1 + 1)) + 1;
    const randomSuit = Math.floor(Math.random() * (4 - 1 + 1)) + 1;

    return { number: cardNumbers[randomNumber - 1], suit: suits[randomSuit - 1] };
  }

  async function startGame() {
    // turn player
    const firstTurnPlayer = players[Math.floor(Math.random() * players.length)];
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
    
    await supabase.from('games').update({ turn_player: small_blind.id }).eq('id', params.id).select();
    await supabase.from('games').update({ dealer: small_blind.id }).eq('id', params.id).select()
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

    // set has incremented to true
    hasIncremented()
  }

 
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
    const {data} = await supabase.from('players').update({ bet: bet }).eq('id', myPlayer.id).select() 
    return data
  }

  async function setActualBet (bet: number) {
    await supabase.from('games').update({actual_bet: bet }).eq('id', params.id).select()
  }

  async function setIsFolded () {
    await supabase.from('players').update({is_folded: true}).eq('id', myPlayer.id).select()
    nextTurn()
  }

  async function nextTurn () {
    console.log({game}, {players})
    console.log(players.every(player => player.bet === game?.actual_bet || player.is_folded && game.has_incremented ))
    if(players.every(player => player.bet === game?.actual_bet || player.is_folded && game.has_incremented )) {
      console.log("all players have matched the bet, new street")
      newStreet()
      return
    }
      
    console.log("next turn called")
    const myPlayerIndex = players.findIndex(player => player.id === myPlayer.id)
    const nextPlayer = players[myPlayerIndex + 1] ? players[myPlayerIndex + 1] : players[0] 
    await supabase.from('games').update({turn_player: nextPlayer.id}).eq('id', params.id).select()
  }

  async function hasIncremented () {
    await supabase.from('games').update({has_incremented: true}).eq('id', params.id).select()
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
          <h1>{JSON.stringify(game.cards)}</h1>
          <span>
            {game.actual_bet}
          </span>
        </>
      }
      
      {sortedPlayers &&
        sortedPlayers.map((player, idx) => (
          <div 
            key={player?.id || `player-${idx}-${Date.now()}`} 
            className="p-4 m-2 text-sm"
          > 
            <h2 className="border size-fit p-2 rounded-full text-[1rem]">Player {idx + 1} </h2>
            <span>{player?.id}</span>
            <p> {player.id === game?.turn_player && "(turn)" } {player.id === game?.dealer && "(dealer)" }</p>
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
        setYourBet={setYourBet} setActualBet={setActualBet} setIsFolded={setIsFolded} hasIncremented={hasIncremented}  nextTurn={nextTurn}
        />
      } 
      
      
    </main>
  );
}
