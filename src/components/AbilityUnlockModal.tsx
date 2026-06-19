import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Sparkles } from 'lucide-react';

export const AbilityUnlockModal = () => {
  const { showAbilityUnlock, unlockAbility, closeAbilityUnlock } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showAbilityUnlock) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showAbilityUnlock]);

  if (!isVisible && !showAbilityUnlock) return null;

  const getOperationHint = () => {
    if (!unlockAbility) return null;
    switch (unlockAbility.id) {
      case 'dash':
        return (
          <>
            <kbd className="px-3 py-1.5 bg-white rounded-lg shadow text-purple-700 font-mono text-sm">空格</kbd>
            <span className="text-purple-400">→</span>
            <span className="text-purple-600 text-sm">快速冲刺</span>
          </>
        );
      case 'glide':
        return (
          <>
            <kbd className="px-3 py-1.5 bg-white rounded-lg shadow text-purple-700 font-mono text-sm">Shift</kbd>
            <span className="text-purple-400">→</span>
            <span className="text-purple-600 text-sm">按住滑翔</span>
          </>
        );
      case 'speed':
        return <span className="text-purple-600 text-sm">飞行速度提升</span>;
      case 'visibility':
        return <span className="text-purple-600 text-sm">探索视野扩大</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
      showAbilityUnlock ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      <div className={`relative pointer-events-auto transform transition-all duration-500 ${
        showAbilityUnlock ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
      }`}>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-2xl border-4 border-yellow-300 max-w-md mx-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-200/20 to-transparent pointer-events-none" />
          
          <div className="relative text-center">
            <div className="relative inline-block mb-4">
              <div className="text-6xl animate-bounce">
                {unlockAbility?.icon}
              </div>
              <div className="absolute -inset-4 bg-yellow-300/30 rounded-full blur-xl animate-pulse" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                新能力解锁！
              </h2>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            
            <h3 className="text-xl font-bold text-purple-700 mb-2">
              {unlockAbility?.name}
            </h3>
            
            <p className="text-purple-600/80 mb-6 text-sm leading-relaxed">
              {unlockAbility?.description}
            </p>
            
            <div className="bg-white/60 rounded-2xl p-4 mb-6">
              <div className="text-sm text-purple-500 mb-2">操作方式</div>
              <div className="flex items-center justify-center gap-2">
                {getOperationHint()}
              </div>
            </div>
            
            <button
              onClick={closeAbilityUnlock}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              太棒了！
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
