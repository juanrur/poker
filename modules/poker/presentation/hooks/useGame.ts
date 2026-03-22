import { useEffect, useState } from "react";
import { SupabaseGameRealtime } from "../../infrastructure/realtime/SupabaseGameRealtime";
import { createClient } from "@/app/db/create-client-client";
import { GameDTO } from "../../application/use-cases/dtos/GameDTO";
import { ActionsDTO } from "@/app/api/games/[game_id]/actions/route";
import { usePlayer } from "./usePlayer";
import { GameDTOMapper } from "../../application/mappers/GameDTOMapper";
import { Game } from "../../domain/entities/Game";

export function useGame (joinCode: GameDTO['joinCode']) {
  const [game, setGame] = useState<GameDTO | null>(null)
  const { playerToken } = usePlayer()

  const gameId = game?.id

  const realtime = new SupabaseGameRealtime(createClient())
  
  // TODO: administrar la salida de la sala del jugador

  // initial load
  useEffect(() => {
    fetch(`/api/games/join/${joinCode}`)
    .then(res => res.json())
    .then(data => setGame(data))
  }, [])
  
  // subscribe to updates
  useEffect(() => {
    if(!gameId) return 
    const unsubscribe = realtime.subscribe(
      gameId,
      async () => {
        fetch(`/api/games/join/${joinCode}`)
        .then(res => res.json())
        .then(data => setGame(data))
      }
    )

    return unsubscribe
  }, [game])

  function optimisticUI (callback: (game: Game) => Game) {
    if(!game) return
    const domainGame = GameDTOMapper.fromDTO(game)
    const newGame = GameDTOMapper.toDTO(callback(domainGame))
    setGame(newGame)
  }
  
  function raise (amount: number) {
    optimisticUI(game => {
      game.raiseCurrentPlayer(amount)
      game.advanceTurn()
      return game
    })

    const dto: ActionsDTO = {
      playerToken,
      type: "raise",
      amount
    }
    fetch(`/api/games/${gameId}/actions`,
      {
        method: 'PUT',
        body: JSON.stringify(dto)
      }
    )
  }  

  function fold () {
    optimisticUI(game => {
      game.foldCurrentPlayer()
      game.advanceTurn()

      if(game.shouldFinishGame()) game.finishGame()

      if (game.shouldAdvanceStreet()) game.advanceStreet()
        
      return game
    })

    const dto: ActionsDTO = {
      playerToken,
      type: "fold"
    }
    fetch(`/api/games/${gameId}/actions`,
      {
        method: 'PUT',
        body: JSON.stringify(dto)
      }
    )
  }  
  
  function check () {
    optimisticUI(game => {   
      game.advanceTurn()
      
      if(game.shouldFinishGame()) game.finishGame()

      if (game.shouldAdvanceStreet()) game.advanceStreet()
      
      return game
    })

    const dto: ActionsDTO = {
      playerToken,
      type: "check"
    }
    fetch(`/api/games/${gameId}/actions`,
      {
        method: 'PUT',
        body: JSON.stringify(dto)
      }
    )
  }  

  function call () {
    optimisticUI(game => {   
      game.callCurrentPlayer()
  
      game.advanceTurn()

      if(game.shouldFinishGame()) game.finishGame()
      
      if (game.shouldAdvanceStreet()) game.advanceStreet()
  
      return game
    })

    const dto: ActionsDTO = {  
      playerToken,
      type: "call"
    }
    fetch(`/api/games/${gameId}/actions`,
      {
        method: 'PUT',
        body: JSON.stringify(dto)
      }
    )
  }
  
  function leave () { 
    setGame(null)
    fetch(`/api/games/${gameId}/leave`,
      {method: 'DELETE'}
    )
  }

  function start () {
    fetch(`/api/games/${gameId}/start`,
      {method: 'PUT'}
    )
  }

  return {game, raise, fold, check, call, leave, start}
}