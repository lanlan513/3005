import { useGameStore } from '../store/gameStore';
import { CompanionAbility, CompanionPersonality } from '../types/game';

const personalityText: Record<CompanionPersonality, string> = {
  curious: '好奇',
  calm: '沉稳',
  playful: '活泼',
  wise: '睿智',
  shy: '害羞',
};

const abilityText: Record<CompanionAbility, string> = {
  light: '✨ 照亮迷雾',
  discover: '🔍 发现道路',
  hint: '💡 谜题提示',
};

const abilityDescription: Record<CompanionAbility, string> = {
  light: '扩大视野范围，让你看得更远',
  discover: '增强隐藏区域的感知能力',
  hint: '在遇到谜题时给予提示',
};

const abilityColor: Record<CompanionAbility, string> = {
  light: '#FFD700',
  discover: '#7B68EE',
  hint: '#20B2AA',
};

export const CompanionPanel = () => {
  const {
    showCompanionPanel,
    closeCompanionPanel,
    companions,
    activeCompanionId,
    setActiveCompanion,
  } = useGameStore();

  if (!showCompanionPanel) return null;

  const unlockedCount = companions.filter(c => c.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 max-w-4xl w-full bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-3xl p-6 shadow-2xl border border-purple-400/30 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🦋</span>
              蝴蝶伙伴
            </h2>
            <p className="text-white/70 mt-1">
              已收集 {unlockedCount} / {companions.length} 只伙伴
            </p>
          </div>
          
          <button
            onClick={closeCompanionPanel}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companions.map((companion) => {
              const isActive = companion.id === activeCompanionId;
              const isUnlocked = companion.unlocked;

              return (
                <div
                  key={companion.id}
                  className={`relative rounded-2xl p-5 transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 border-2 border-white/50 scale-[1.02]'
                      : isUnlocked
                      ? 'bg-white/10 border border-white/20 hover:bg-white/15 cursor-pointer'
                      : 'bg-black/20 border border-white/10 opacity-60'
                  }`}
                  onClick={() => {
                    if (isUnlocked) {
                      setActiveCompanion(isActive ? null : companion.id);
                    }
                  }}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-green-500">
                      携带中
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          isUnlocked ? '' : 'grayscale'
                        }`}
                        style={{
                          background: isUnlocked
                            ? `radial-gradient(circle, ${companion.color}44 0%, transparent 70%)`
                            : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {isUnlocked ? (
                          <div className="text-4xl">🦋</div>
                        ) : (
                          <div className="text-3xl text-white/30">❓</div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-xl font-bold ${
                            isUnlocked ? '' : 'text-white/50'
                          }`}
                          style={{ color: isUnlocked ? companion.color : undefined }}
                        >
                          {isUnlocked ? companion.name : '???'}
                        </h3>
                        {isUnlocked && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: companion.color + '33',
                              color: companion.color,
                            }}
                          >
                            {personalityText[companion.personality]}
                          </span>
                        )}
                      </div>

                      {isUnlocked ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-sm font-medium"
                              style={{ color: abilityColor[companion.ability] }}
                            >
                              {abilityText[companion.ability]}
                            </span>
                            <span className="text-white/50 text-sm">
                              +{Math.round(companion.abilityPower * 100)}%
                            </span>
                          </div>

                          <p className="text-white/70 text-sm mb-2">
                            {abilityDescription[companion.ability]}
                          </p>

                          <p className="text-white/60 text-xs italic">
                            "{companion.quote}"
                          </p>

                          {isActive && (
                            <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
                              <p className="text-green-300 text-xs text-center">
                                ✨ 能力已激活，效果正在生效
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div>
                          <p className="text-white/50 text-sm mb-2">
                            解锁条件：{companion.encounterCondition}
                          </p>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${companion.encounterProgress}%`,
                                backgroundColor: companion.color,
                              }}
                            />
                          </div>
                          <p className="text-white/40 text-xs mt-1 text-right">
                            {Math.round(companion.encounterProgress)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              按 <kbd className="px-2 py-1 bg-white/10 rounded text-white/80 text-xs">B</kbd> 键快速打开/关闭此面板
            </p>
            {activeCompanionId && (
              <button
                onClick={() => setActiveCompanion(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors"
              >
                卸下当前伙伴
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
