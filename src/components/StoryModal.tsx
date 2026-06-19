import { useGameStore } from '../store/gameStore';
import { X, Sparkles } from 'lucide-react';
import { STORIES } from '../data/stories';

export const StoryModal = () => {
  const { showStory, currentStory, closeStory, collectedFragments } = useGameStore();

  if (!showStory || !currentStory) return null;

  const isLast = currentStory.order === STORIES.length;
  const allCollected = collectedFragments.length === STORIES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeStory}
      />

      <div className="relative max-w-2xl w-full animate-scale-in">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-rose-400/30 rounded-[2rem] blur-2xl animate-pulse" />

        <div className="relative bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-xl rounded-[2rem] p-10 border border-white/80 shadow-2xl">
          <button
            onClick={closeStory}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-purple-500 hover:text-purple-700 transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/60 mb-5">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-purple-600 text-sm font-medium tracking-wider">
                第 {currentStory.order} 段记忆
              </span>
            </div>

            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent font-serif tracking-wider mb-2">
              {currentStory.title}
            </h2>

            <div className="flex items-center justify-center gap-1 mt-3">
              {STORIES.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    i < currentStory.order
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="my-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />

          <div className="px-4">
            <p className="text-lg leading-loose text-purple-800/90 font-light tracking-wide indent-8">
              {currentStory.content}
            </p>
          </div>

          <div className="my-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />

          {isLast && allCollected ? (
            <div className="text-center">
              <p className="text-purple-600 text-lg mb-5 tracking-wider">
                🦋 所有记忆已集齐，故事圆满 🦋
              </p>
              <button
                onClick={closeStory}
                className="px-10 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium tracking-wider shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                继续探索
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-purple-500/70 mb-5">
                还有 {STORIES.length - collectedFragments.length} 段记忆等待发现
              </p>
              <button
                onClick={closeStory}
                className="px-10 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium tracking-wider shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                继续探索
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
