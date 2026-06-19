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

export const CompanionEncounter = () => {
  const {
    showCompanionEncounter,
    encounterCompanion,
    acceptCompanion,
    closeCompanionEncounter,
  } = useGameStore();

  if (!showCompanionEncounter || !encounterCompanion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 max-w-md w-full bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-3xl p-8 shadow-2xl border border-purple-400/30">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div
              className="w-28 h-28 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${encounterCompanion.color}66 0%, transparent 70%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce">🦋</div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            遇见了新伙伴！
          </h2>
          
          <div className="mb-4">
            <span
              className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-2"
              style={{ backgroundColor: encounterCompanion.color + '33', color: encounterCompanion.color }}
            >
              {personalityText[encounterCompanion.personality]}性格
            </span>
          </div>

          <h3
            className="text-2xl font-bold mb-3"
            style={{ color: encounterCompanion.color }}
          >
            {encounterCompanion.name}
          </h3>

          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white/90 text-lg italic">
              "{encounterCompanion.quote}"
            </p>
          </div>

          <p className="text-white/80 mb-4">
            {encounterCompanion.description}
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl">{abilityText[encounterCompanion.ability].split(' ')[0]}</span>
              <span className="text-white font-semibold">
                {abilityText[encounterCompanion.ability].split(' ').slice(1).join(' ')}
              </span>
            </div>
            <p className="text-white/70 text-sm">
              {abilityDescription[encounterCompanion.ability]}
            </p>
            <p className="text-white/60 text-xs mt-2">
              能力强度: +{Math.round(encounterCompanion.abilityPower * 100)}%
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeCompanionEncounter}
              className="flex-1 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 border border-white/20"
            >
              稍后再说
            </button>
            <button
              onClick={acceptCompanion}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ backgroundColor: encounterCompanion.color }}
            >
              成为伙伴！
            </button>
          </div>
        </div>

        <button
          onClick={closeCompanionEncounter}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
