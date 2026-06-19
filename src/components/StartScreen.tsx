import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Sparkles } from 'lucide-react';

export const StartScreen = () => {
  const navigate = useNavigate();
  const startGame = useGameStore((s) => s.startGame);
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    const ps = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: 4 + Math.random() * 8,
    }));
    setParticles(ps);
  }, []);

  const handleStart = () => {
    startGame();
    navigate('/game');
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-purple-200 via-pink-100 to-green-100">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/60 animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={`petal-${i}`}
          className="absolute animate-petal"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            width: 8 + Math.random() * 10,
            height: 8 + Math.random() * 10,
            backgroundColor: ['#FFB6C8', '#FFC0CB', '#FFE4E9', '#F8C8DC'][i % 4],
            borderRadius: '50% 0 50% 0',
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 6}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 bg-clip-text text-transparent tracking-widest font-serif">
              蝶忆
            </h1>
            <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
          </div>
          <p className="text-2xl text-purple-600/80 tracking-[0.4em] font-light mt-6">
            Butterfly Memories
          </p>
          <p className="text-lg text-purple-500/60 mt-4 tracking-wider">
            — 在梦幻花园中，拾起散落的记忆 —
          </p>
        </div>

        <button
          onClick={handleStart}
          className="group relative px-16 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-500 hover:scale-105 active:scale-95 font-medium tracking-widest animate-glow"
        >
          <span className="relative z-10">开始旅程</span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl scale-110" />
        </button>

        <div className="mt-20 bg-white/40 backdrop-blur-md rounded-3xl px-10 py-6 border border-white/60 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-center text-purple-700/80 text-lg font-medium mb-4 tracking-wider">
            操作说明
          </p>
          <div className="flex items-center gap-6 text-purple-600/70">
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">W</kbd>
                <div />
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">A</kbd>
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">S</kbd>
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">D</kbd>
              </div>
              <span className="text-sm">或</span>
              <div className="grid grid-cols-3 gap-1">
                <div />
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">↑</kbd>
                <div />
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">←</kbd>
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">↓</kbd>
                <kbd className="w-8 h-8 bg-white/80 rounded flex items-center justify-center text-sm shadow-sm border border-purple-200">→</kbd>
              </div>
            </div>
            <span className="text-base ml-2">控制蝴蝶飞舞</span>
          </div>
          <p className="text-center text-purple-500/60 text-sm mt-4">
            寻找发光的记忆碎片，解锁尘封的故事
          </p>
        </div>
      </div>
    </div>
  );
};
