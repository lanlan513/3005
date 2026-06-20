import { useGameStore } from '../store/gameStore';
import { X, Lock, Check, Play, Sparkles } from 'lucide-react';
import { EMOTIONS, EMOTION_COMBINATIONS, checkCombinationUnlock } from '../data/emotions';
import { EmotionCount, EmotionType } from '../types/game';

export const EmotionGardenPanel = () => {
  const {
    showEmotionGarden,
    closeEmotionGarden,
    emotionCounts,
    unlockedCombinations,
    activeCombinationId,
    setActiveCombination,
    emotionStories,
    openEmotionStory,
  } = useGameStore();

  if (!showEmotionGarden) return null;

  const totalEmotions = (Object.values(emotionCounts) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeEmotionGarden}
      />
      <div className="relative w-[900px] max-h-[85vh] bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-8 py-5 border-b border-purple-100/60 bg-gradient-to-r from-pink-50/50 via-purple-50/50 to-blue-50/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌈</span>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                情绪花园
              </h2>
              <p className="text-sm text-purple-500/70 mt-0.5">
                收集不同情绪碎片，解锁隐藏的梦境花园
              </p>
            </div>
          </div>
          <button
            onClick={closeEmotionGarden}
            className="p-2 rounded-xl hover:bg-purple-100/60 transition-colors group"
          >
            <X className="w-5 h-5 text-purple-400 group-hover:text-purple-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-purple-700 text-lg">情绪收集</h3>
              <span className="ml-auto text-sm text-purple-400">
                总计 {totalEmotions} 枚情绪碎片
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {(Object.keys(EMOTIONS) as EmotionType[]).map(type => {
                const emotion = EMOTIONS[type];
                const count = emotionCounts[type];
                return (
                  <div
                    key={type}
                    className="relative rounded-2xl p-5 border-2 overflow-hidden transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: emotion.bgColor,
                      borderColor: count > 0 ? emotion.color + '88' : 'transparent',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${emotion.glowColor}, transparent 70%)`,
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">{emotion.icon}</span>
                        <span
                          className="text-2xl font-bold"
                          style={{ color: emotion.color }}
                        >
                          {count}
                        </span>
                      </div>
                      <div
                        className="font-bold text-lg"
                        style={{ color: emotion.color }}
                      >
                        {emotion.name}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {emotion.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✨</span>
              <h3 className="font-bold text-purple-700 text-lg">情绪组合 · 隐藏花园</h3>
              <span className="ml-auto text-sm text-purple-400">
                {unlockedCombinations.length} / {EMOTION_COMBINATIONS.length} 已解锁
              </span>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {EMOTION_COMBINATIONS.map(combo => {
                const isUnlocked = unlockedCombinations.includes(combo.id);
                const isActive = activeCombinationId === combo.id;
                const canUnlock = checkCombinationUnlock(combo, emotionCounts);
                const relatedStory = emotionStories.find(s => s.id === combo.unlocksStoryId);
                const storyUnlocked = relatedStory?.unlocked || false;

                const requiredDisplay: { type: EmotionType; count: number }[] = [];
                (Object.keys(combo.requiredEmotions) as EmotionType[]).forEach(type => {
                  const required = combo.requiredEmotions[type] || 0;
                  if (required > 0) {
                    requiredDisplay.push({ type, count: required });
                  }
                });

                return (
                  <div
                    key={combo.id}
                    className={`relative rounded-2xl p-6 border-2 overflow-hidden transition-all duration-300 ${
                      isActive ? 'ring-4 ring-offset-2' : ''
                    } ${
                      isUnlocked
                        ? 'cursor-pointer hover:scale-[1.02]'
                        : canUnlock
                        ? 'cursor-pointer opacity-90 hover:opacity-100'
                        : 'opacity-75'
                    }`}
                    style={{
                      backgroundColor: isUnlocked
                        ? combo.colorTheme + '15'
                        : canUnlock
                        ? combo.colorTheme + '08'
                        : '#F8FAFC',
                      borderColor: isActive
                        ? combo.colorTheme
                        : isUnlocked
                        ? combo.colorTheme + '66'
                        : canUnlock
                        ? combo.colorTheme + '44'
                        : '#E2E8F0',
                      boxShadow: isActive ? `0 0 0 4px white, 0 0 0 6px ${combo.colorTheme}55` : undefined,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        background: isUnlocked
                          ? `linear-gradient(135deg, ${combo.colorTheme}, transparent)`
                          : 'none',
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                              style={{
                                backgroundColor: combo.colorTheme + '33',
                              }}
                            >
                              {combo.id.includes('dawn') ? '🌅' :
                               combo.id.includes('deep') ? '🌊' :
                               combo.id.includes('phoenix') ? '🔥' :
                               combo.id.includes('star') ? '🌌' :
                               combo.id.includes('rainbow') ? '🌈' : '💫'}
                            </div>
                          ) : canUnlock ? (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-yellow-100 animate-pulse">
                              ✨
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-100">
                              <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4
                              className="font-bold text-lg"
                              style={{
                                color: isUnlocked ? combo.colorTheme : canUnlock ? '#78716c' : '#94a3b8',
                              }}
                            >
                              {isUnlocked || canUnlock ? combo.name : '???'}
                            </h4>
                            {isActive && (
                              <span
                                className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: combo.colorTheme,
                                  color: 'white',
                                }}
                              >
                                当前激活
                              </span>
                            )}
                          </div>
                        </div>
                        {isUnlocked && relatedStory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEmotionStory(relatedStory.id);
                            }}
                            className="p-2 rounded-xl hover:bg-white/80 transition-colors group"
                            title={storyUnlocked ? '阅读故事' : '解锁后可阅读'}
                          >
                            {storyUnlocked ? (
                              <Play className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-gray-500 mb-1.5">所需情绪碎片</div>
                        <div className="flex flex-wrap gap-2">
                          {requiredDisplay.map(({ type, count }) => {
                            const emotion = EMOTIONS[type];
                            const current = emotionCounts[type];
                            const met = current >= count;
                            return (
                              <div
                                key={type}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  met ? 'border-transparent' : 'border-gray-200'
                                }`}
                                style={{
                                  backgroundColor: met ? emotion.color + '22' : '#F1F5F9',
                                  color: met ? emotion.color : '#94a3b8',
                                }}
                              >
                                <span>{emotion.icon}</span>
                                <span>{current}/{count}</span>
                                {met && <Check className="w-3 h-3" />}
                              </div>
                            );
                          })}
                          {combo.minTotal > 0 && (
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                totalEmotions >= combo.minTotal ? 'border-transparent bg-purple-100 text-purple-600' : 'border-gray-200 bg-gray-50 text-gray-400'
                              }`}
                            >
                              <span>✨</span>
                              <span>{totalEmotions}/{combo.minTotal} 总计</span>
                              {totalEmotions >= combo.minTotal && <Check className="w-3 h-3" />}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed ${
                        isUnlocked ? 'text-gray-700' : canUnlock ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {isUnlocked ? combo.description : canUnlock ? '探索此地以解锁新的梦境' : '收集更多情绪碎片来解锁...'}
                      </p>

                      <div className="mt-4 flex gap-2">
                        {isUnlocked ? (
                          <button
                            onClick={() => {
                              if (isActive) {
                                setActiveCombination(null);
                              } else {
                                setActiveCombination(combo.id);
                              }
                            }}
                            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                              isActive
                                ? 'text-white active:scale-95'
                                : 'bg-white/70 hover:bg-white active:scale-95'
                            }`}
                            style={{
                              backgroundColor: isActive ? combo.colorTheme : undefined,
                              color: isActive ? 'white' : combo.colorTheme,
                              border: isActive ? `2px solid ${combo.colorTheme}` : `2px solid ${combo.colorTheme}66`,
                            }}
                          >
                            {isActive ? '✓ 应用主题' : '激活此花园'}
                          </button>
                        ) : canUnlock ? (
                          <div className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-yellow-50 text-yellow-700 text-center border-2 border-yellow-200 animate-pulse">
                            ✨ 靠近该区域即可发现
                          </div>
                        ) : (
                          <div className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-gray-100 text-gray-400 text-center">
                            🔒 尚未达成条件
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-gradient-to-r from-purple-50/80 to-blue-50/80 p-6 border border-purple-100/60">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-bold text-purple-700 mb-2">探索指南</h4>
                <ul className="text-sm text-purple-600/80 space-y-1.5 leading-relaxed">
                  <li>• 收集不同情绪的记忆碎片，它们带有喜悦(☀️)、遗憾(🌧️)、勇气(🔥)、思念(🌙)的属性</li>
                  <li>• 当满足某些情绪组合时，地图上会浮现出对应风格的隐藏花园区域</li>
                  <li>• 激活不同的情绪组合会改变地图的整体色调氛围</li>
                  <li>• 解锁组合后可阅读与之相关的特殊剧情故事</li>
                  <li>• 按 G 键或点击右上角按钮随时打开此面板</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="px-8 py-4 border-t border-purple-100/60 bg-white/50 flex justify-between items-center">
          <div className="text-sm text-purple-500/70">
            提示：按 ESC 或点击外部关闭面板
          </div>
          <button
            onClick={closeEmotionGarden}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition-all active:scale-95"
          >
            继续探索
          </button>
        </div>
      </div>
    </div>
  );
};
