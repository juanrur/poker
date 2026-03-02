import { RoundEvents, RoundStates, transition } from "@/modules/poker/domain/machines/RoundMachine";
import { Game } from "../../modules/poker/domain/entities/Game";
import { Player } from "../../modules/poker/domain/entities/Player";

describe("Poker domain tests", () => {
  let game: Game;
  let mike: Player;
  let bob: Player;

  beforeEach(() => {
    game = new Game();
    
    mike = new Player("Mike");
    bob = new Player("Bob");
    game.addPlayer(mike);
    game.addPlayer(bob);
    
    game.initializeDeck(); 
    
  });

  test("players can place bets", () => {
    mike.placeBet(50);
    expect(mike.bet).toBe(50);
    expect(mike.money).toBe(950);
  });

  test("advanceTurn skips folded players", () => {
    game.currentTurnPlayer = mike;
    bob.fold();
    game.advanceTurn();
    expect(game.currentTurnPlayer.id).toBe(mike.id);
  })

  test('assignTurnAndDealer work well', () => {
    game.assignTurnAndDealer()

    const dealer = game.dealer
    const turn = game.currentTurnPlayer

    expect(dealer instanceof Player)
    expect(turn instanceof Player)
    

    const dealerIndex = game.players.indexOf(dealer!)
    const shouldHaveTurnIndex = (dealerIndex + 3) % game.players.length
    const shouldHaveTurnPlayer = game.players[shouldHaveTurnIndex]

    expect(turn?.id).toBe(shouldHaveTurnPlayer.id)
  })

  test('postSmallAndBigBlind work well', () => {
    game.assignTurnAndDealer()
    game.postSmallAndBigBlind()

    const dealerIndex = game.players.indexOf(game.dealer!)
    const smallBlindPlayer = game.players[(dealerIndex + 1) % game.players.length]
    const bigBlindPlayer = game.players[(dealerIndex + 2) % game.players.length]
    
    expect(smallBlindPlayer.bet).toBe(game.smallBlind)
    expect(bigBlindPlayer.bet).toBe(game.smallBlind * 2)
  })

  test('round machine transition work well', () => {
    game.roundState = transition(game.roundState, RoundEvents.RAISE)

    expect(game.roundState).toBe(RoundStates.INCREASED)

    game.roundState = transition(game.roundState, RoundEvents.ALL_EQUAL)

    expect(game.roundState).toBe(RoundStates.COMPLETE)
  })
});
