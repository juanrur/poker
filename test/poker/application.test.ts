import { CreateGame } from "@/modules/poker/application/use-cases/CreateGame"
import { GameRepository } from "@/modules/poker/domain/repositories/GameRepository"
import { CreatePlayer } from "@/modules/poker/application/use-cases/CreatePlayer"
import { JoinGame } from "@/modules/poker/application/use-cases/JoinGame"
import { StartGame } from "@/modules/poker/application/use-cases/StartGame"
import { Call } from "@/modules/poker/application/use-cases/Call"
import { GameMapper, GameRow } from "@/modules/poker/infrastructure/mappers/GameMapper"
import { PlayerMapper, PlayerRow } from "@/modules/poker/infrastructure/mappers/PlayerMapper"
import { Check } from "@/modules/poker/application/use-cases/Check"
import { evaluateHand } from "@/modules/poker/domain/services/HandEvaluator"
import { Player } from "@/modules/poker/domain/entities/Player"
import { Raise } from "@/modules/poker/application/use-cases/Raise"
import { Fold } from "@/modules/poker/application/use-cases/Fold"
import { Game } from "@/modules/poker/domain/entities/Game"

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
    getGameByJoinCode: jest.fn(async gameCode => {
      const playersInGame = Object.values(players)
      const game = Object.values(games).find(game => game.join_code = gameCode)
      if(!game) return null
      return GameMapper.toDomain(playersInGame, game) ?? null
    })
  } 
  
  let game: Game
  let startGame: StartGame
  let fold: Fold
  let check: Check
  let call: Call
  let raise: Raise

  beforeEach(async () => {
    games = {}
    players = {}
    const createGame = new CreateGame(mockRepository)
    const createPlayer = new CreatePlayer(mockRepository)
    const playerOne = await createPlayer.execute('juan')

    const newGame = await createGame.execute(playerOne.id) 
    if(!newGame) return
    game = newGame

    if(!game) return

    const joinGame = new JoinGame(mockRepository)
    const playerTwo = await createPlayer.execute('clara')
    await joinGame.execute(game.id, playerTwo.id)
    
    startGame = new StartGame(mockRepository)
    fold = new Fold(mockRepository) 
    check = new Check(mockRepository) 
    call = new Call(mockRepository) 
    raise = new Raise(mockRepository) 

  })
  
  test('can create a game and join players', async () => {
    const updatedGame = await mockRepository.getGameById(game.id)
    expect(updatedGame?.players).toHaveLength(2)
  })

  test('street advance', async () => {

    await startGame.execute(game.id)
    
    
    const call = new Call(mockRepository)
    await call.execute(game.id)

    const updatedGame = await mockRepository.getGameById(game.id)
    expect(updatedGame?.street).toBe(1)
  })
  
  test('winner is who should be and money is well split', async () => {
    await startGame.execute(game.id)
    
    await call.execute(game.id)    
    
    expect((await mockRepository.getGameById(game.id))?.street).toBe(1)
    await check.execute(game.id)
    await check.execute(game.id)
    
    expect((await mockRepository.getGameById(game.id))?.street).toBe(2)
    await check.execute(game.id)
    await check.execute(game.id)
    
    // check for future winner
    let winner: Player
    
    const updatedGameStreet2 = await mockRepository.getGameById(game.id)
    
    updatedGameStreet2?.players.reduce(
      (preValue, player) => {
        const handValue = evaluateHand(player.cards, updatedGameStreet2?.cards) 
        if(handValue > preValue) {
          winner = player
          return handValue
        }
        return preValue
      }, 
      0
    )
    
    // check all player have the correct bet
    for(const player of ((await mockRepository.getGameById(game.id)))!.players) {
      expect(player.bet).toBe(40)
      expect(player.money).toBe(960)
    }
    console.log((await mockRepository.getGameById(game.id))?.pot)
    expect((await mockRepository.getGameById(game.id))?.street).toBe(3)
    await check.execute(game.id)
    await check.execute(game.id)
    // end of game
    
    expect((await mockRepository.getGameById(game.id))?.street).toBe(0)
        

    const updatedGame = await mockRepository.getGameById(game.id)!
    if(!updatedGame) return

    for(const player of updatedGame.players) {
      expect(player.bet).toBe(0)
    }
    
    expect((await mockRepository.getPlayerById(winner!.id))?.money).toBe(1040)
    expect((await mockRepository.getGameById(game.id))
      ?.players
      .find(player => player.id !== winner.id)
      ?.money
    ).toBe(960)
    expect(updatedGame.currentTurnPlayer).toBeNull()
  })

  test('you can raise', async () => {
    await startGame.execute(game.id)
    
    await call.execute(game.id)
    expect((await mockRepository.getGameById(game.id))?.street).toBe(1)

    await raise.execute(game.id, 200)
    await call.execute(game.id)

    
    expect((await mockRepository.getGameById(game.id))?.street).toBe(2)
  })

  test('game finish when everyone is folded',async () => {
    await startGame.execute(game.id)    
    await call.execute(game.id)

    await fold.execute(game.id)

    expect((await mockRepository.getGameById(game.id))?.street).toBe(0)
  })
})
