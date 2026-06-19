import { useGameStore } from '../store/gameStore';
import { formatHintMessage } from '../data/companions';

const typeIcon: Record<string, string> = {
  fragment: '✨',
  flower: '🌸',
  hidden: '🌿',
  companion: '🦋',
};

export const HintBubble = () => {
  const {
    showHint,
    currentHint,
    activeCompanionId,
    companions,
    dismissHint,
  } = useGameStore();

  const activeCompanion = companions.find(c => c.id === activeCompanionId);

  if (!showHint || !currentHint || !activeCompanion || activeCompanion.ability !== 'hint') {
    return null;
  }

  const hintMessage = formatHintMessage(currentHint);

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center pointer-events-none px-4">
      <div
        className="pointer-events-auto max-w-md w-full animate-bounce-in"
      >
        <div
          className="relative bg-white/90 backdrop-blur-md rounded-3xl border-2 rounded-tl-none shadow-2xl overflow-hidden"
          style={{ borderColor: activeCompanion.color }}
        >
          <div
            className="absolute -top-0 -left-0 w-0 h-0"
            style={{
              borderStyle: 'solid',
              borderWidth: '12px 0 12px 12px',
              borderColor: `transparent transparent transparent ${activeCompanion.color}00`,
            }}
          />
          
          <div className="flex items-start gap-3 p-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: activeCompanion.color + '33' }}
            >
              🦋
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold" style={{ color: activeCompanion.color }}>
                  {activeCompanion.name}
                </span>
                <span className="text-gray-400 text-xs">说：</span>
                </div>
                <span className="text-lg">
                  {typeIcon[currentHint.type]}
                </span>
              </div>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {hintMessage}
              </div>
            </div>

            <button
              onClick={dismissHint}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          60% {
            opacity: 1;
            transform: translateY(-5px) scale(1.02);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};
