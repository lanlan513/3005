import { useGameStore } from '../store/gameStore';
import { X, Heart, BookOpen, Sparkles, Flower2 } from 'lucide-react';

export const FlowerCard = () => {
  const { showFlowerCard, currentFlower, closeFlowerCard } = useGameStore();

  if (!showFlowerCard || !currentFlower) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeFlowerCard}
      />

      <div className="relative max-w-2xl w-full animate-scale-in">
        <div 
          className="absolute -inset-4 rounded-[2rem] blur-2xl animate-pulse"
          style={{ background: `linear-gradient(to right, ${currentFlower.color}40, ${currentFlower.color}20, ${currentFlower.color}40)` }}
        />

        <div className="relative bg-gradient-to-br from-white/95 via-green-50/95 to-emerald-50/95 backdrop-blur-xl rounded-[2rem] p-8 border border-white/80 shadow-2xl overflow-hidden">
          <div 
            className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30"
            style={{ background: currentFlower.color }}
          />
          <div 
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ background: currentFlower.color }}
          />

          <button
            onClick={closeFlowerCard}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-emerald-500 hover:text-emerald-700 transition-all duration-300 hover:scale-110 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg animate-bounce-slow"
                style={{ background: `linear-gradient(135deg, ${currentFlower.color}, ${currentFlower.color}dd)` }}
              >
                <Flower2 className="w-10 h-10 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200/60 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-emerald-600 text-sm font-medium tracking-wider">
                    花朵记忆
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent font-serif tracking-wider">
                  {currentFlower.name}
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl p-5 bg-white/60 border border-emerald-100/60">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-bold text-emerald-700 tracking-wider">
                    花语
                  </h3>
                </div>
                <p className="text-emerald-600/90 font-medium text-lg italic">
                  「{currentFlower.flowerLanguage}」
                </p>
              </div>

              <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-50/80 to-pink-50/80 border border-purple-100/60">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-bold text-purple-700 tracking-wider">
                    记忆碎片
                  </h3>
                </div>
                <p className="text-purple-700/80 leading-relaxed font-light tracking-wide indent-8">
                  {currentFlower.memory}
                </p>
              </div>

              <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-100/60">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-emerald-700 tracking-wider">
                    植物小知识
                  </h3>
                </div>
                <p className="text-emerald-700/80 leading-relaxed font-light tracking-wide text-sm">
                  {currentFlower.knowledge}
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={closeFlowerCard}
                className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-medium tracking-wider shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                继续探索
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
