import { useGameStore } from '../store/gameStore';
import { X, BookOpen, Heart } from 'lucide-react';
import { EMOTION_COMBINATIONS } from '../data/emotions';

export const EmotionStoryModal = () => {
  const {
    showEmotionStory,
    currentEmotionStory,
    closeEmotionStory,
  } = useGameStore();

  if (!showEmotionStory || !currentEmotionStory) return null;

  const story = currentEmotionStory;
  const relatedCombo = EMOTION_COMBINATIONS.find(c => c.unlocksStoryId === story.id);
  const comboColor = relatedCombo?.colorTheme || '#8B5CF6';
  const comboName = relatedCombo?.name || '';

  const paragraphs = story.content.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={closeEmotionStory}
      />
      <div
        className="relative w-[680px] max-w-[92vw] max-h-[85vh] bg-gradient-to-br from-white via-purple-50/50 to-white backdrop-blur-xl rounded-3xl border-2 shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]"
        style={{
          borderColor: comboColor + '55',
        }}
      >
        <div
          className="h-3 w-full"
          style={{
            background: `linear-gradient(90deg, ${comboColor}, ${comboColor}AA, ${comboColor})`,
          }}
        />

        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: comboColor }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: comboColor }}
        />

        <div className="relative flex items-center justify-between px-8 py-5 border-b border-purple-100/60">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                backgroundColor: comboColor + '22',
              }}
            >
              <BookOpen
                className="w-6 h-6"
                style={{ color: comboColor }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: comboColor + '22',
                    color: comboColor,
                  }}
                >
                  {comboName}
                </span>
                <span className="text-xs text-purple-400">· 特殊剧情</span>
              </div>
              <h2
                className="text-2xl font-bold mt-1"
                style={{ color: comboColor }}
              >
                {story.title}
              </h2>
            </div>
          </div>
          <button
            onClick={closeEmotionStory}
            className="p-2 rounded-xl hover:bg-purple-100/60 transition-colors group"
          >
            <X className="w-5 h-5 text-purple-400 group-hover:text-purple-600" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-10 py-8">
          <div className="space-y-5">
            {paragraphs.map((para, idx) => (
              <p
                key={idx}
                className="text-gray-700 leading-8 text-[15px] tracking-wide indent-8"
                style={{
                  animation: `slideUp_0.5s_ease-out_${idx * 0.08}s_both`,
                }}
              >
                {para}
              </p>
            ))}
          </div>

          <div
            className="mt-8 pt-6 border-t flex items-center justify-center gap-2"
            style={{ borderColor: comboColor + '33' }}
          >
            <Heart className="w-4 h-4" style={{ color: comboColor }} />
            <span
              className="text-sm"
              style={{ color: comboColor + 'CC' }}
            >
              · 情绪花园 · 特殊剧情 ·
            </span>
            <Heart className="w-4 h-4" style={{ color: comboColor }} />
          </div>
        </div>

        <div
          className="relative px-8 py-5 border-t bg-gradient-to-r from-white/50 to-purple-50/50 flex justify-between items-center"
          style={{ borderColor: comboColor + '22' }}
        >
          <div className="text-sm text-purple-500/70">
            按 ESC 或点击外部关闭
          </div>
          <div className="flex gap-3">
            <button
              onClick={closeEmotionStory}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                color: comboColor,
                border: `2px solid ${comboColor}44`,
                backgroundColor: comboColor + '0A',
              }}
            >
              稍后再读
            </button>
            <button
              onClick={closeEmotionStory}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${comboColor}, ${comboColor}DD)`,
              }}
            >
              铭记于心
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
