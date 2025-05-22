'use client';

import { useState, useEffect } from 'react';
import { SongPlayer } from '@/components/SongPlayer';
import { GuessInput } from '@/components/GuessInput';
import { getDailySong, addGuess, type Song } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function PlayPage() {
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadSong() {
      try {
        const song = await getDailySong();
        setCurrentSong(song);
      } catch (err) {
        setError('Failed to load song. Please try again later.');
        console.error('Error loading song:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSong();
  }, []);

  const handleGuess = async (guess: string) => {
    if (!currentSong) return;

    const isCorrect = guess.toLowerCase() === currentSong.title.toLowerCase();
    const timeTaken = currentTime;

    try {
      await addGuess({
        song_id: currentSong.id,
        time_taken: timeTaken,
        correct: isCorrect,
        session_id: crypto.randomUUID(),
      });

      if (isCorrect) {
        setIsGameOver(true);
        toast({
          title: "Correct! 🎉",
          description: `You guessed it in ${Math.round(timeTaken)} seconds!`,
          variant: "default",
        });
      } else {
        toast({
          title: "Try again!",
          description: "That's not the right song. Keep guessing!",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error recording guess:', err);
      toast({
        title: "Error",
        description: "Failed to record your guess. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    // TODO: Implement game over logic based on time
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center font-rajdhani">
            Loading...
          </h1>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center font-rajdhani text-red-500">
            {error}
          </h1>
        </div>
      </main>
    );
  }

  if (!currentSong) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center font-rajdhani text-red-500">
            No song available
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center font-rajdhani">
          Bollywoodle 🎬
        </h1>
        
        <div className="space-y-6">
          <SongPlayer
            trackId={currentSong.soundcloud_id}
            onTimeUpdate={handleTimeUpdate}
          />
          
          <GuessInput
            onSubmit={handleGuess}
            disabled={isGameOver}
          />
        </div>
      </div>
      <Toaster />
    </main>
  );
} 