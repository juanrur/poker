import Card from "./card"
import CardReverse from "./card-reverse"
import PlayerTag from "./player-tag"

export default function Players({players, game, myPlayer} : {players: any[][], game: any, myPlayer: any}) { 
  return <div className="w-full overflow-x-auto">
          <section className="inline-flex gap-4 my-4 min-w-full">
            {players &&
              players.map((players, idx) => {
                if(players.length === 0) {
                  return <div key={`empty-${idx}`} className="p-4 m-2 text-sm flex-1"> </div>
                } else {
                  return (
                    players.map((player: any) => (
                      <div 
                        key={player?.id || `player-${idx}-${Date.now()}`} 
                        style={idx !== 1 ? { flex: '1' } : {}}
                        className="p-4 m-2 text-sm flex flex-col gap-4"
                      > 
                        <header className="flex gap-2 items-center">
                          <h2 className="border size-fit p-2 rounded-full text-[1rem]">{player?.name}</h2>
                          {player?.id === game?.dealer && <PlayerTag>Dealer</PlayerTag>}
                          {player?.id === game?.turn_player && <PlayerTag>Turn</PlayerTag>}
                        </header>
                        <div className="">
                          {
                            player.cards && myPlayer?.id  === player.id &&
                            <div className="flex gap-2 ">
                              <Card suit={player.cards[0]?.suit} number={player.cards[0]?.number} />
                              <Card suit={player.cards[1]?.suit} number={player.cards[1]?.number} />
                            </div>
                          }
                          {
                            player.cards && myPlayer?.id !== player.id &&
                            <div className="flex gap-2">
                              <CardReverse />
                              <CardReverse />
                            </div>
                          }
                        </div>
                        <span>{JSON.stringify(player.bet)}</span>
                        <p>{JSON.stringify(player.money)}</p>
                      </div>
                    ))
                  )
                }
              })
            }
          </section>
        </div>
}