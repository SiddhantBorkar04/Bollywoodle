'use client';

import { useEffect, useRef, useState } from 'react';

interface SongPlayerProps {
  trackId: string;
  unlockedSeconds: number; // how much of the song is unlocked for play
  currentTime: number; // current playback position (seconds)
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  onSeek?: (time: number) => void;
}

const SEGMENTS = [1, 1, 3, 4, 5]; // seconds per segment
const TOTAL = SEGMENTS.reduce((a, b) => a + b, 0); // 14
const UI_TOTAL = 16; // for visual parity

export function SongPlayer({
  trackId,
  unlockedSeconds,
  currentTime,
  onTimeUpdate,
  onPlayStateChange,
  onSeek,
}: SongPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(currentTime || 0);
  const widgetRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unlockedSecondsRef = useRef(unlockedSeconds);

  // Always keep the ref up to date
  unlockedSecondsRef.current = unlockedSeconds;

  // Load SoundCloud Widget API and set up player
  useEffect(() => {
    let widget: any = null;
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      widget.bind('ready', () => {
        widget.bind('playProgress', (e: any) => {
          const seconds = e.currentPosition / 1000;
          setPosition(seconds);
          onTimeUpdate?.(seconds);
          // Pause if we reach the latest unlockedSeconds
          if (seconds >= unlockedSecondsRef.current) {
            widget.pause();
            setPlaying(false);
            onPlayStateChange?.(false);
          }
        });
        widget.bind('pause', () => {
          setPlaying(false);
          onPlayStateChange?.(false);
        });
        widget.bind('play', () => {
          setPlaying(true);
          onPlayStateChange?.(true);
        });
      });
    };
    return () => {
      document.body.removeChild(script);
    };
    // Only run on trackId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, onTimeUpdate, onPlayStateChange]);

  // Play/pause logic
  const handlePlay = () => {
    if (!widgetRef.current) return;
    if (playing) {
      // If currently playing, pause and reset to 0
      widgetRef.current.pause();
      widgetRef.current.seekTo(0);
      setPosition(0);
    } else {
      // If currently paused/stopped, play from 0
      widgetRef.current.seekTo(0);
      setPosition(0);
      widgetRef.current.play();
    }
  };

  // Timeline rendering
  let acc = 0;
  const segments = SEGMENTS.map((len, i) => {
    const start = acc;
    const end = acc + len;
    acc = end;
    const unlocked = unlockedSeconds >= end;
    const played = position >= end;
    const playingInThis = position >= start && position < end;
    return {
      start,
      end,
      unlocked,
      played,
      playingInThis,
      width: `${(len / UI_TOTAL) * 100}%`,
    };
  });

  // Sound bars animation
  const SoundBars = () => (
    <div className="flex items-end gap-1 h-6 pointer-events-none">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`w-1.5 rounded bg-[#a78bfa] animate-soundbar-bar${i+1}${playing ? '' : '-paused'}`}
          style={{ height: '8px', animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden SoundCloud iframe */}
      <iframe
        ref={iframeRef}
        id={`soundcloud-player-${trackId}`}
        width="0"
        height="0"
        style={{ display: 'none' }}
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&auto_play=false&show_artwork=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
      />
      {/* Timeline */}
      <div className="w-full flex items-center gap-2 mt-2 mb-4">
        <span className="text-xs text-white/60">0:00</span>
        <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-[#23232a]">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`h-full transition-all ${seg.unlocked ? 'bg-[#a78bfa]' : 'bg-[#44434a]'} ${seg.played ? 'opacity-80' : ''}`}
              style={{ width: seg.width }}
            >
              {seg.playingInThis && (
                <div className="h-full bg-white/80 animate-pulse" style={{ width: `${((position - seg.start) / (seg.end - seg.start)) * 100}%` }} />
              )}
            </div>
          ))}
        </div>
        <span className="text-xs text-white/60">0:16</span>
      </div>
      {/* Play button */}
      <button
        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-[#18181b] shadow-lg hover:scale-105 transition-transform relative"
        onClick={handlePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <SoundBars />
        ) : (
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="18" fill="none" />
            <polygon points="14,11 27,18 14,25" fill="#a78bfa" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Add to globals.css:
// @keyframes soundbar { 0% { height: 8px; } 50% { height: 24px; } 100% { height: 8px; } }
// .animate-soundbar { animation: soundbar 1s infinite ease-in-out; }
// .animate-soundbar-paused { animation-play-state: paused; } 