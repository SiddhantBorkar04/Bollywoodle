console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types for our database tables
export type Song = {
  id: number;
  title: string;
  artist: string;
  soundcloud_id: string;
  embed_url: string;
  is_daily_song: boolean;
  created_at: string;
};

export type Guess = {
  id: number;
  song_id: number;
  time_taken: number;
  correct: boolean;
  created_at: string;
  session_id: string;
};

// Helper functions for common operations
export async function getDailySong() {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('is_daily_song', true)
    .single();

  if (error) throw error;
  return data as Song;
}

export async function getRandomSong() {
  // Get the count of songs
  const { count, error: countError } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;
  if (!count || count === 0) throw new Error('No songs found');

  // Pick a random offset
  const randomOffset = Math.floor(Math.random() * count);

  // Fetch one song at the random offset
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .range(randomOffset, randomOffset)
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No songs found');
  return data[0];
}

export async function addGuess(guess: Omit<Guess, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('guesses')
    .insert(guess)
    .select()
    .single();

  if (error) throw error;
  return data as Guess;
}

export async function getAllSongTitles() {
  const { data, error } = await supabase
    .from('songs')
    .select('title, artist');
  if (error) throw error;
  return data || [];
} 