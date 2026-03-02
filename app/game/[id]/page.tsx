'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import Actions from "@/app/components/actions"
import { Card as CardType, cardNumber, suit } from "@/app/types";
import { redirect, useParams } from "next/navigation";
import { createClient } from "@/app/db/create-client-client";
import router from "next/router";
import Card from "@/app/components/card";
import Players from "@/app/components/players";
import { usePlayer } from "@/app/components/player-context";
import { evaluateHand } from "@/modules/poker/domain/services/HandEvaluator";

export default function Home() {
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([])
  const supabase = useMemo(() => createClient(), []);
  const initialLoadDone = useRef(false);
  const playerID = usePlayer().player?.id

  const myPlayer = players.find(player => player.id === playerID)
  
  const cardNumbers: cardNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const suits: suit[] = ["heart", "spade", "club", "diamond"];
  const deck : any[] = [];

  for(let i=0; i<52; i++) {
    const card = { number: cardNumbers[i % 13], suit: suits[Math.floor(i / 13)] };
    deck.push(card);
  }
  
  const params = useParams();

  async function whoWin() {
    const playerHands = players.map(player => ({ ...player, handValue: evaluateHand(player.cards, game.cards) }));
    const sortedHands = playerHands.sort((a, b) => b.handValue - a.handValue);
    const winner = sortedHands[0];
    winner.money += players.reduce((acc, player) => acc + player.bet, 0)
    await supabase.from('players').update({ money: winner.money }).eq('id', winner.id).select()
    for (const player of players) {
      await supabase.from('players').update({ bet: 0, is_folded: false, cards: [] }).eq('id', player.id).select()
    }
  }

  async function roundOver () {
    await supabase.from('games').update({turn_player: null}).eq('id', params.id).select()
    const updatedPlayers = players.map(player => ({...player, bet: 0, is_folded: false}))
    for (const player of updatedPlayers) {
      await supabase.from('players').update({bet: 0, is_folded: false, cards: null}).eq('id', player.id).select()
    }
    setPlayers(updatedPlayers)
    await supabase.from('games').update({actual_bet: 0, street: 0, cards: [], has_incremented: false, deck: [], dealer: null}).eq('id', params.id).select()
    whoWin()

  }

  async function newStreet () {
    const newDeck = game.deck
    const shuffledNewDeck = [...newDeck].sort(() => Math.random() - 0.5)
    let newCards : any = []
    if (game.street === 3) {
      roundOver()
    } 
    else if (game.street === 0) newCards = [shuffledNewDeck.pop(), shuffledNewDeck.pop(), shuffledNewDeck.pop()]
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
  // useEffect(() => {
  //   // recomendado borrarla para que no haya varios clientes intentando hacer lo mismo y es recomendable hacerlo cuando se calee el next turn solamente
  //   console.log("turn player changed:", game?.turn_player)

  //   console.log({
  //     gameExists: !game,
  //     userExists: !user,
  //     deckExists: !game?.deck,
  //     turnIsUser: !game?.turn_player !== user?.id,
  //     // player === game o is_folded
  //     playersMatched: !players.every(player => player.bet === game?.actual_bet || player.is_folded),
  //     hasIncrementedOrDealer: !(!game?.has_incremented && game?.turn_player === game?.dealer),
  //     overall: !!game && !!user && !!game?.deck && game?.turn_player === user?.id && players.every(player => player.bet === game?.bet || player.is_folded) && (game?.has_incremented || game?.turn_player === game?.dealer)
  //   })

  //   console.log({ players })
    
  //   if (!game) return
  //   if(!user) return
  //   if(!game?.deck) return 
  //   if(!game?.turn_player !== user?.id) return
  //   if(!players.every(player => player.bet === game.actual_bet || player.is_folded )) return
  //   if(!(!game.has_incremented && game.turn_player === game.dealer)) return
    
  //   console.log("new street triggered")
   

  //   newStreet()

  //   // se puede optimizar para cada vez que me toque a mi
  // }, [game?.turn_player])
  
  // Insert user
  useEffect(() => {
    async function insertUserIntoGame() {
      if (!playerID) redirect("/")
        
      const { data } = await supabase.from('players').select('*').eq('id', playerID).single()
        
      if (data?.game === params.id) return

      await supabase.from('players').update({ game: params.id }).eq('id', playerID).then(({ error }) => {
        if (error) {
          console.error("Error inserting player into game:", error);
          alert(error.message);
          return;
        }
      });
    }

    insertUserIntoGame()
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
          setPlayers(prevPlayers => {
              if (payload.eventType === 'INSERT') {
                if (prevPlayers.some(p => p.id === payload.new.id)) return prevPlayers;
                return [...prevPlayers, payload.new].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              }
              if (payload.eventType === 'UPDATE') {
                if (!prevPlayers.some(p => p.id === payload.new.id)) {
                  return [...prevPlayers, payload.new].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                }

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
      console.log("borrando a: " + playerID)
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
  }, [playerID])


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

  function deletePlayer () {
    fetch('/api/delete-player/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId: playerID,
        nextPlayerId: players[(players.findIndex(player => player.id === playerID) + 1) % players.length]?.id,
        gameId: params.id,
        isDealer: myPlayer?.id === game?.dealer
      }),
      keepalive: true
    })
    .catch((error) => console.log(error))
  }

  async function setYourBet (bet: number) {
    const updatedPlayers = players.map(player => {
      if (player.id === myPlayer.id) {
        return { ...player, bet: bet };
      }
      return player;
    });
    setPlayers(updatedPlayers);
    const {data} = await supabase.from('players').update({ bet: bet }).eq('id', myPlayer.id).select() 
    return updatedPlayers;
  }

  async function setActualBet (bet: number) {
    await supabase.from('games').update({actual_bet: bet }).eq('id', params.id).select()
  }

  async function setIsFolded () {
    const {data} = await supabase.from('players').update({is_folded: true}).eq('id', myPlayer.id).select()
  
    const updatedPlayers = players.map(player => {
      if (player.id === myPlayer.id) {
        return { ...player, is_folded: true };
      }
      return player;
    });
    setPlayers(updatedPlayers);
    return updatedPlayers;
  }

  async function nextTurn (updatedPlayers?: any[]) {
    console.log("next turn called")
    const playersToCheck = updatedPlayers || players;
    const playersNotFolded = (playersToCheck || players).filter(player => !player.is_folded)
    if(playersNotFolded.length <= 1) {
      console.log("round over called from next turn")
      roundOver()
      return
    }

    console.log({updatedPlayers, playersToCheck, players})    
    const currentMyPlayer = playersToCheck.find(player => player.id === playerID)
    const myPlayerIndex = playersToCheck.findIndex(player => player.id === currentMyPlayer?.id)
    const nextPlayer = playersToCheck[myPlayerIndex + 1] ? playersToCheck[myPlayerIndex + 1] : playersToCheck[0] 

    if(
        (playersToCheck.every(player => (player.bet === game?.actual_bet || player.is_folded) && game.has_incremented) 
      ||
        (!game.has_incremented && nextPlayer.id === game.dealer)
    )) 
    {
      console.log("new street called from next turn")
      newStreet()
      return
    }
          
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

  function moveToCenter (playerArray: any, player: any) {
    const newPlayerArray = playerArray.filter((p: any) => p.id !== player.id);
    const leftPlayers = newPlayerArray.slice(0, Math.floor(newPlayerArray.length / 2));
    const rightPlayers = newPlayerArray.slice(Math.floor(newPlayerArray.length / 2));
    const newArray = [leftPlayers, [player], rightPlayers]
    return newArray;
  }

  const sortedPlayers = useMemo(() =>{
    if(!myPlayer) return players;
    return moveToCenter(players, myPlayer);
  }, [players, myPlayer]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <button className="border border-white p-3 absolute top-2 left-2 rounded" onClick={handleGoOut}>salir</button>
      {
        game &&
        <header>
          <h1 className="my-4">ID: {game.id}</h1>
          <button onClick={copyID}>copy</button>
          <div className="flex gap-2">
            {game.cards?.map((card: CardType, idx: number) => (
              <Card key={idx} suit={card.suit} number={card.number} />
            ))}
          </div>
          <span>
            {game.actual_bet}
          </span>
        </header>
      }

      <Players players={sortedPlayers} game={game} myPlayer={myPlayer} />

      {
        !game?.turn_player && 
        <button onClick={startGame}>Start Game</button>
      }

      { !myPlayer?.is_folded && isMyTurn &&
        <Actions 
          actualBet={game?.actual_bet}  
          yourBet={myPlayer?.bet}  
          money={myPlayer?.money} 
          hasIncremented={hasIncremented}  
          setActualBet={setActualBet} 
          setYourBet={setYourBet} 
          setIsFolded={setIsFolded} 
          nextTurn={nextTurn}
        />
      } 
      
      
    </main>
  );
}
