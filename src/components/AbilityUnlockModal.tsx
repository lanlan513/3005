import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Sparkles, TrendingUp } from 'lucide-react';

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

  const isLevelUp = unlockAbility && unlockAbility.level > 1 && unlockAbility.unlocked;

  const getTitle = () => {
    if (isLevelUp) {
      return '能力升级！';
    }
    return '新能力解锁！';
  };

  const getDescription = () => {
    if (!unlockAbility) return '';
    if (isLevelUp) {
      const levelText = `当前等级：${unlockAbility.level} / ${unlockAbility.maxLevel}`;
      if (unlockAbility.id === 'speed') {
        return `飞行速度进一步提升！${levelText}。你现在可以飞得更快了！`;
      }
      if (unlockAbility.id === 'visibility') {
        return `探索视野进一步扩大！${levelText}。你现在可以看到更远的地方了！`;
      }
      if (unlockAbility.id === 'dash') {
        return `冲刺能力增强！${levelText}。冲刺的距离和威力都提升了！`;
      }
      if (unlockAbility.id === 'glide') {
        return `滑翔效率提升！${levelText}。滑翔时消耗的能量更少了！`;
      }
    }
    return unlockAbility.description;
  };

  const getOperationHint = () => {
    if (!unlockAbility) return null;
    
    if (isLevelUp) {
      const bonusPercent = Math.round((unlockAbility.level - 1) * (unlockAbility.id === 'speed' ? 25 : unlockAbility.id === 'visibility' ? 30 : 30));
      return (
        <span className="text-purple-600 text-sm">
          效果提升：<span className="font-bold text-emerald-600">+{bonusPercent}%</span>
        </span>
      );
    }
    
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
        return <span className="text-purple-600 text-sm">飞行速度 +25%</span>;
      case 'visibility':
        return <span className="text-purple-600 text-sm">探索视野 +30%</span>;
      default:
        return null;
    }
  };

  const getHintLabel = () => {
    if (isLevelUp) {
      return '升级效果';
    }
    return '操作方式';
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
      showAbilityUnlock ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      <div className={`relative pointer-events-auto transform transition-all duration-500 ${
        showAbilityUnlock ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
      }`}>
        <div className={`bg-gradient-to-br ${isLevelUp ? 'from-emerald-50 to-teal-50' : 'from-purple-50 to-pink-50'} rounded-3xl p-8 shadow-2xl border-4 ${isLevelUp ? 'border-emerald-300' : 'border-yellow-300'} max-w-md mx-4 overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-t ${isLevelUp ? 'from-emerald-200/20' : 'from-yellow-200/20'} to-transparent pointer-events-none`} />
          
          <div className="relative text-center">
            <div className="relative inline-block mb-4">
              <div className="text-6xl animate-bounce">
                {unlockAbility?.icon}
              </div>
              <div className={`absolute -inset-4 ${isLevelUp ? 'bg-emerald-300/30' : 'bg-yellow-300/30'} rounded-full blur-xl animate-pulse`} />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              {isLevelUp ? (
                <TrendingUp className="w-5 h-5 text-emerald-500 animate-bounce" />
              ) : (
                <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
              )}
              <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${isLevelUp ? 'from-emerald-600 to-teal-600' : 'from-purple-600 to-pink-600'}`}>
                {getTitle()}
              </h2>
              {isLevelUp ? (
                <TrendingUp className="w-5 h-5 text-emerald-500 animate-bounce" />
              ) : (
                <Sparkles className="w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
              )}
            </div>
            
            <h3 className={`text-xl font-bold ${isLevelUp ? 'text-emerald-700' : 'text-purple-700'} mb-2`}>
              {unlockAbility?.name}
              {unlockAbility && (
                <span className={`ml-2 text-sm ${isLevelUp ? 'text-emerald-500' : 'text-purple-400'}`}>
                  Lv.{unlockAbility.level}
                </span>
              )}
            </h3>
            
            {unlockAbility && (
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: unlockAbility.maxLevel }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < (unlockAbility?.level || 0)
                        ? isLevelUp 
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-t from-purple-500 to-pink-400'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
            
            <p className={`${isLevelUp ? 'text-emerald-600/80' : 'text-purple-600/80'} mb-6 text-sm leading-relaxed`}>
              {getDescription()}
            </p>
            
            <div className="bg-white/60 rounded-2xl p-4 mb-6">
              <div className={`text-sm ${isLevelUp ? 'text-emerald-500' : 'text-purple-500'} mb-2`}>
                {getHintLabel()}
              </div>
              <div className="flex items-center justify-center gap-2">
                {getOperationHint()}
              </div>
            </div>
            
            <button
              onClick={closeAbilityUnlock}
              className={`w-full py-3 px-6 bg-gradient-to-r ${isLevelUp ? 'from-emerald-500 to-teal-500' : 'from-purple-500 to-pink-500'} text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200`}
            >
              太棒了！
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
