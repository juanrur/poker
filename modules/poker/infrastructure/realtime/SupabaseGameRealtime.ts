import { GameRealtime } from "../../application/realtime/GameRealtime";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseGameRealtime implements GameRealtime {
  constructor(private supabase: SupabaseClient){}

  subscribe(gameId: string, onUpdate: () => void): () => void {
    // GAMES Subscription
    const gameChannel = this.supabase.channel(`games-${gameId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      () => onUpdate()
    )
    .subscribe()

    // PLAYERS Subscription
    const playersChannel = this.supabase.channel(`players-${gameId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `game=eq.${gameId}` },
      () => onUpdate()
    )
    .subscribe();

    // Clearing channels
    return () => {
      this.supabase.removeChannel(gameChannel);
      this.supabase.removeChannel(playersChannel);
    };
  }
  
}