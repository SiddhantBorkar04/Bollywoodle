'use client';

import { useState, useEffect } from 'react';
import { SongPlayer } from '@/components/SongPlayer';
import { GuessInput } from '@/components/GuessInput';
import { getRandomSong, getAllSongTitles, addGuess, type Song } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Info, BarChart2, HelpCircle, CheckCircle2, XCircle, SkipForward, Loader2 } from 'lucide-react';

const SEGMENTS = [1, 1, 3, 4, 5, 2]; // 2 at the end to fill to 16 visually

const getPerformanceMessage = (guesses: number, won: boolean) => {
  if (!won) return 'Better luck next time!';
  if (guesses === 1) return 'Incredible!';
  if (guesses === 2) return 'Amazing!';
  if (guesses <= 4) return 'Not Bad!';
  return 'You got it!';
};

function GuessBar({ guesses, max, won }: { guesses: number, max: number, won: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 my-2">
      {[...Array(max)].map((_, i) => (
        <div
          key={i}
          className={`w-6 h-2 rounded ${i < guesses ? (won ? 'bg-[#a78bfa]' : 'bg-red-400') : 'bg-[#44434a]'}`}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ title: string; artist: string }[]>([]);
  const [guessHistory, setGuessHistory] = useState<
    Array<{ type: 'guess'; value: string; correct: boolean } | { type: 'skip' }>
  >([]);
  const { toast } = useToast();
  const [showGameOver, setShowGameOver] = useState(false);
  const [countdown, setCountdown] = useState(30); // 30s for demo, set to 86400 for daily
  const [countdownPaused, setCountdownPaused] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [song, allTitles] = await Promise.all([
          getRandomSong(),
          getAllSongTitles()
        ]);
        setCurrentSong(song);
        setSuggestions(allTitles);
      } catch (err) {
        setError('Failed to load song. Please try again later.');
        console.error('Error loading song:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGuess = async (guess: string) => {
    if (!currentSong || isGameOver) return;
    const isCorrect = guess.toLowerCase() === currentSong.title.toLowerCase();
    const timeTaken = currentTime;
    try {
      await addGuess({
        song_id: currentSong.id,
        time_taken: timeTaken,
        correct: isCorrect,
        session_id: crypto.randomUUID(),
      });
      setGuessHistory(prev => [
        ...prev,
        { type: 'guess', value: guess, correct: isCorrect },
      ]);
      if (isCorrect) {
        setIsGameOver(true);
        setShowGameOver(true);
        toast({
          title: "Correct! 🎉",
          description: `You guessed it in ${Math.round(timeTaken)} seconds!`,
          variant: "default",
          duration: 3500,
        });
      } else {
        if (guessHistory.length + 1 >= 6) {
          setIsGameOver(true);
          setShowGameOver(true);
          toast({
            title: "Game Over",
            description: `You've used all your guesses!`,
            variant: "destructive",
            duration: 3500,
          });
        } else {
          toast({
            title: "Try again!",
            description: "That's not the right song. Keep guessing!",
            variant: "destructive",
            duration: 2500,
          });
        }
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

  const handleSkip = () => {
    if (isGameOver || guessHistory.length >= 6) return;
    setGuessHistory(prev => [...prev, { type: 'skip' }]);
    if (guessHistory.length + 1 >= 6) {
      setIsGameOver(true);
      setShowGameOver(true);
      toast({
        title: "Game Over",
        description: `You've used all your guesses!`,
        variant: "destructive",
        duration: 3500,
      });
    }
    // TODO: Reveal more of the song (not implemented yet)
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    // TODO: Implement game over logic based on time
  };

  // Countdown timer effect
  useEffect(() => {
    if (!showGameOver || countdownPaused) return;
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showGameOver, countdown, countdownPaused]);

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
    <main className="min-h-screen bg-gradient-to-b from-[#18181b] to-[#1e1e23] text-white p-0">
      <div className="max-w-2xl mx-auto flex flex-col min-h-screen">
        {/* Header Section */}
        <div className="w-full flex items-center justify-between px-4 py-6 border-b border-[#23232a] bg-[#18181b]">
          {/* Info (About) Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-full p-3 bg-white/10 hover:bg-white/20 transition" title="About">
                <Info className="w-7 h-7 text-white" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>About</DialogTitle>
              <div className="space-y-4 text-base text-[#23232a] mt-2">
                <p>
                  Taking inspiration from the popular music guessing game, Heardle, Bollywoodle is a spin off that incorporates modern Bollywood music hits. Guess the song based on the short clip to test your knowledge on Bollywood bangers.
                </p>
                <p>
                  This game was made by{' '}
                  <a href="https://www.linkedin.com/in/sborkar04/" target="_blank" rel="noopener noreferrer" className="text-[#a78bfa] underline font-semibold">Siddhant Borkar</a>.
                  If you're having issues with the game or have song recommendations, feel free to reach out at{' '}
                  <a href="mailto:siddhant.borkar4@gmail.com" className="text-[#a78bfa] underline">siddhant.borkar4@gmail.com</a>.
                </p>
                <p className="text-xs text-gray-500">
                  Bollywoodle is not affiliated with Heardle, or SoundCloud. All music rights to their respective owners.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Centered Title with Stats Dialog to the right */}
          <div className="flex-1 flex items-center justify-center relative">
            <span className="text-4xl font-bold font-rajdhani flex items-center gap-4">
              Bollywoodle <span role="img" aria-label="clapper">🎬</span>
            </span>
          </div>

          {/* How to Play Dialog (far right) */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-full p-3 bg-white/10 hover:bg-white/20 transition" title="How to Play">
                <HelpCircle className="w-7 h-7 text-white" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>How to Play</DialogTitle>
              <div className="space-y-4 mt-2 text-base">
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="music">🎵</span>
                  <span>Listen to the intro, then find the correct song in the list.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="volume">🔊</span>
                  <span>Skipped or incorrect attempts unlock more of the intro.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="thumbs up">👍</span>
                  <span>Answer in as few tries as possible and share your score!</span>
                </div>
                <div className="flex justify-center pt-2">
                  <button className="bg-[#a78bfa] text-white font-bold px-6 py-2 rounded-lg text-lg shadow hover:bg-[#7c3aed] transition">PLAY</button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Guess Grid Section */}
        <div className="flex flex-col gap-2 px-4 pt-6">
          {[...Array(6)].map((_, i) => {
            const entry = guessHistory[i];
            return (
              <div key={i} className="h-10 rounded bg-[#23232a] border border-[#23232a] flex items-center px-4 text-lg font-medium text-white/80">
                {entry ? (
                  entry.type === 'guess' ? (
                    <>
                      {entry.correct ? (
                        <CheckCircle2 className="text-green-400 w-6 h-6 mr-3" />
                      ) : (
                        <XCircle className="text-red-400 w-6 h-6 mr-3" />
                      )}
                      <span className={entry.correct ? 'text-green-400' : 'text-red-400'}>{entry.value}</span>
                    </>
                  ) : (
                    <>
                      <SkipForward className="text-gray-400 w-6 h-6 mr-3" />
                      <span className="text-gray-400 font-bold tracking-widest">SKIPPED</span>
                    </>
                  )
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Song Player & Timeline Section */}
        <div className="flex flex-col items-center px-4 pt-6">
          <div className="w-full">
            <SongPlayer
              trackId={currentSong?.soundcloud_id || ''}
              unlockedSeconds={SEGMENTS.slice(0, guessHistory.length + 1).reduce((a, b) => a + b, 0)}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>
        </div>

        {/* Guess Input Row */}
        <div className="flex items-center gap-2 px-4 pt-6 pb-8">
          <div className="flex-1">
            <GuessInput
              onSubmit={handleGuess}
              suggestions={suggestions}
              disabled={isGameOver}
              onSkip={handleSkip}
              skipLabel={`SKIP (+${SEGMENTS[guessHistory.length] || 1}s)`}
            />
          </div>
        </div>

        {/* Footer Section (placeholder) */}
        <div className="mt-auto px-4 py-4 flex items-center justify-center text-xs text-white/40 border-t border-[#23232a] bg-[#18181b]">
          Bollywoodle &copy; {new Date().getFullYear()} &mdash; Inspired by Heardle
        </div>
      </div>
      <Toaster />
      <Dialog open={showGameOver} onOpenChange={setShowGameOver}>
        <DialogContent className="max-w-xl">
          {/* SoundCloud Embed */}
          <div className="mb-4">
            <iframe
              width="100%"
              height="120"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${currentSong.soundcloud_id}&auto_play=false&show_artwork=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`}
              className="rounded"
            />
          </div>
          {/* Performance Message */}
          <div className="text-2xl font-bold text-center mb-2">
            {getPerformanceMessage(guessHistory.length, guessHistory.some(g => g.type === 'guess' && g.correct))}
          </div>
          {/* Guess Bar */}
          <GuessBar guesses={guessHistory.length} max={6} won={guessHistory.some(g => g.type === 'guess' && g.correct)} />
          {/* Time to solve or fail message */}
          <div className="text-center text-lg mb-4">
            {guessHistory.some(g => g.type === 'guess' && g.correct)
              ? `You got Bollywoodle in ${Math.round(currentTime)} seconds!`
              : 'The answer was revealed above.'}
          </div>
          {/* Countdown spinner */}
          <div className="flex flex-col items-center mb-4">
            <button
              className="flex items-center gap-2 text-[#a78bfa] hover:text-[#7c3aed] font-semibold text-lg focus:outline-none"
              onClick={() => setCountdownPaused(p => !p)}
            >
              <Loader2 className={`animate-spin ${countdownPaused ? 'opacity-30' : ''}`} />
              {countdownPaused ? 'Timer paused. Listen to the song!' : `Next game in ${Math.floor(countdown/60)}:${(countdown%60).toString().padStart(2, '0')}`}
            </button>
          </div>
          {/* New Game Button */}
          <div className="flex justify-center">
            <button
              className="bg-[#a78bfa] text-white font-bold px-8 py-3 rounded-lg text-lg shadow hover:bg-[#7c3aed] transition"
              onClick={() => { setShowGameOver(false); window.location.reload(); }}
            >
              NEW GAME
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
