import { useGameStore } from '../store/gameStore';
import { BookOpen, Sparkles } from 'lucide-react';

export const HUD = () => {
  const { fragments, collectedFragments, openStoryBook } = useGameStore();
  const total = fragments.length;
  const collected = collectedFragments.length;
  const progress = (collected / total) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <div className="absolute top-6 left-6 pointer-events-auto">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-purple-700 font-medium tracking-wider">记忆碎片</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-purple-600">{collected}</span>
            <span className="text-purple-400">/</span>
            <span className="text-xl text-purple-400">{total}</span>
          </div>
          <div className="w-40 h-2 bg-white/50 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 pointer-events-auto">
        <button
          onClick={openStoryBook}
          className="flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <BookOpen className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
          <span className="text-purple-700 font-medium tracking-wider">故事集</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold">
            {collected}
          </div>
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 border border-white/40">
          <p className="text-purple-600/70 text-sm tracking-wider">
            WASD 或 方向键 控制飞舞 · 收集发光的记忆碎片
          </p>
        </div>
      </div>
    </div>
  );
};
