import { CreateGame } from "@/modules/poker/application/use-cases/CreateGame"
import { GameRepository } from "@/modules/poker/domain/repositories/GameRepository"
import { CreatePlayer } from "@/modules/poker/application/use-cases/CreatePlayer"
import { JoinGame } from "@/modules/poker/application/use-cases/JoinGame"
import { StartGame } from "@/modules/poker/application/use-cases/StartGame"
import { Call } from "@/modules/poker/application/use-cases/Call"
import { GameMapper, GameRow } from "@/modules/poker/infrastructure/mappers/GameMapper"
import { PlayerMapper, PlayerRow } from "@/modules/poker/infrastructure/mappers/PlayerMapper"
import { Check } from "@/modules/poker/application/use-cases/Check"
import { GameDTOMapper } from "@/modules/poker/application/mappers/GameDTOMapper"

describe('Poker application test', () => {
  let games: Record<string, GameRow> = {}
  let players: Record<string, PlayerRow> = {}
  
  const mockRepository: GameRepository = {
    save: jest.fn(async game => {
      const { gameRow, playerRows } = GameMapper.toRow(game) 
      games[game.id] = gameRow
      for(const player of playerRows) {
        players[player.id] = player
      }
      return game
    }),
    savePlayer: jest.fn(async player => {
      players[player.id] = PlayerMapper.toRow(player)
      return player
    }),
    getGameById: jest.fn(async gameId => {
      const playersInGame = Object.values(players)
      return GameMapper.toDomain(playersInGame, games[gameId]) ?? null
    }),
    getPlayerById: jest.fn(async playerId => {
      return PlayerMapper.toDomain(players[playerId]) ?? null
    }),
  } 


  beforeEach(() => {
    games = {}
    players = {}
  })

  test('can create a game and join players', async () => {
    const createGame = new CreateGame(mockRepository)
    const createPlayer = new CreatePlayer(mockRepository)
    const playerOne = await createPlayer.execute('juan')

    const game = await createGame.execute(playerOne.id)
    
    if(!game) return

    const joinGame = new JoinGame(mockRepository)
    const playerTwo = await createPlayer.execute('clara')
    await joinGame.execute(game.id, playerTwo.id)

    const updatedGame = await mockRepository.getGameById(game.id)
    expect(updatedGame?.players).toHaveLength(2)
  })

 

  test('street advance', async () => {
    const createGame = new CreateGame(mockRepository)
    const createPlayer = new CreatePlayer(mockRepository)
    const playerOne = await createPlayer.execute('juan')
    const game = await createGame.execute(playerOne.id)
    if(!game) return

    const joinGame = new JoinGame(mockRepository)
    const playerTwo = await createPlayer.execute('clara')
    await joinGame.execute(game.id, playerTwo.id)

    const startGame = new StartGame(mockRepository)
    await startGame.execute(game.id)
    
    
    const call = new Call(mockRepository)
    await call.execute(game.id)

    const updatedGame = await mockRepository.getGameById(game.id)
    expect(updatedGame?.street).toBe(1)
  })
  
  test('play a game', async () => {
    const createGame = new CreateGame(mockRepository)
    const createPlayer = new CreatePlayer(mockRepository)
    const playerOne = await createPlayer.execute('juan')
    const game = await createGame.execute(playerOne.id)
    if(!game) return

    const joinGame = new JoinGame(mockRepository)
    const playerTwo = await createPlayer.execute('clara')
    await joinGame.execute(game.id, playerTwo.id)

    const startGame = new StartGame(mockRepository)
    await startGame.execute(game.id)
    
    const call = new Call(mockRepository)
    const check = new Check(mockRepository)

    await call.execute(game.id)
    await check.execute(game.id)
    
    await check.execute(game.id)
    await check.execute(game.id)
    
    await check.execute(game.id)
    await check.execute(game.id)

    const updatedGame = await mockRepository.getGameById(game.id)

    console.log({updatedGame: GameDTOMapper.toDTO(updatedGame!)})
  })
})
