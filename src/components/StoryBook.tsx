import { useGameStore } from '../store/gameStore';
import { STORIES } from '../data/stories';
import { X, Lock, Sparkles, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StoryBook = () => {
  const { showStoryBook, closeStoryBook, unlockedStories, collectedFragments, resetGame } = useGameStore();
  const navigate = useNavigate();

  if (!showStoryBook) return null;

  const isUnlocked = (storyId: string) => unlockedStories.includes(storyId);
  const allCollected = collectedFragments.length === STORIES.length;

  const handleReset = () => {
    resetGame();
    closeStoryBook();
  };

  const handleGoHome = () => {
    closeStoryBook();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={closeStoryBook}
      />

      <div className="relative max-w-4xl w-full max-h-[85vh] animate-scale-in">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-rose-400/20 rounded-[2rem] blur-2xl" />

        <div className="relative bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-2xl overflow-hidden">
          <div className="sticky top-0 z-10 bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-xl px-8 py-6 border-b border-purple-100/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-serif tracking-wider">
                    记忆故事集
                  </h2>
                </div>
                <p className="text-purple-500/70 text-sm tracking-wider">
                  已收集 {collectedFragments.length} / {STORIES.length} 段记忆
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="w-11 h-11 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-purple-500 hover:text-purple-700 transition-all duration-300 hover:scale-110"
                  title="重新开始"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-11 h-11 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-purple-500 hover:text-purple-700 transition-all duration-300 hover:scale-110"
                  title="返回首页"
                >
                  <Home className="w-5 h-5" />
                </button>
                <button
                  onClick={closeStoryBook}
                  className="w-11 h-11 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-purple-500 hover:text-purple-700 transition-all duration-300 hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${(collectedFragments.length / STORIES.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8 overflow-y-auto max-h-[65vh]">
            {allCollected && (
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-rose-100/80 border border-purple-200/60 text-center">
                <p className="text-3xl mb-2">🦋✨🌸</p>
                <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-wider">
                  恭喜！所有记忆已集齐
                </p>
                <p className="text-purple-600/70 mt-2">
                  这段温柔的故事，永远留在了心间
                </p>
              </div>
            )}

            <div className="grid gap-5">
              {STORIES.map((story, index) => {
                const unlocked = isUnlocked(story.id);
                return (
                  <div
                    key={story.id}
                    className={`relative rounded-2xl p-6 border transition-all duration-500 ${
                      unlocked
                        ? 'bg-white/70 border-purple-200/60 hover:bg-white/90 hover:shadow-lg hover:shadow-purple-200/50'
                        : 'bg-white/30 border-purple-100/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg font-bold ${
                          unlocked
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-purple-100/60 text-purple-400'
                        }`}
                      >
                        {unlocked ? (
                          <span className="font-serif">{index + 1}</span>
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-xl font-bold mb-2 tracking-wider ${
                            unlocked
                              ? 'bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-serif'
                              : 'text-purple-300'
                          }`}
                        >
                          {unlocked ? story.title : '???'}
                        </h3>
                        {unlocked ? (
                          <p className="text-purple-700/80 leading-relaxed font-light tracking-wide indent-8">
                            {story.content}
                          </p>
                        ) : (
                          <p className="text-purple-400/70 italic">
                            这段记忆尚未被寻回，继续在花园中探索吧...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
