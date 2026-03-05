import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { useLanguage } from '../LanguageContext';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
  message: Message;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  message,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const { t } = useLanguage();

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\&\?\/\s]+)/);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(message.videoUrl);

  return (
    <div className="w-full h-full bg-black flex flex-col">
      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center bg-black">
        {videoId ? (
          <iframe
            ref={playerRef}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
            title={message.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="text-white text-center">
            <p>Invalid video URL</p>
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div className="bg-slate-900 text-white p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{message.title}</h2>
          <p className="text-slate-300 text-sm">{message.date} • {message.duration}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="p-3 hover:bg-slate-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-3 hover:bg-slate-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="bg-slate-700 h-1 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoPlayer;