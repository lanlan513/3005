import { useGameStore } from '../store/gameStore';
import { BookOpen, Sparkles, Flower2, Zap, Wind } from 'lucide-react';
import { FLOWER_DATA } from '../data/flowers';

export const HUD = () => {
  const { 
    fragments, 
    collectedFragments, 
    discoveredFlowers, 
    openStoryBook,
    abilities,
    butterfly,
  } = useGameStore();
  const total = fragments.length;
  const collected = collectedFragments.length;
  const progress = (collected / total) * 100;
  
  const totalFlowers = FLOWER_DATA.length;
  const discovered = discoveredFlowers.length;
  const flowerProgress = (discovered / totalFlowers) * 100;

  const speedAbility = abilities.find(a => a.id === 'speed');
  const visibilityAbility = abilities.find(a => a.id === 'visibility');
  const dashAbility = abilities.find(a => a.id === 'dash');
  const glideAbility = abilities.find(a => a.id === 'glide');

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <div className="absolute top-6 left-6 pointer-events-auto space-y-3">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-purple-700 font-medium tracking-wider">记忆碎片</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-purple-600">{collected}</span>
            <span className="text-purple-400">/</span>
            <span className="text-xl text-purple-400">{total}</span>
          </div>
          <div className="w-40 h-2 bg-white/50 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🦋</span>
            <span className="text-purple-700 font-medium tracking-wider">能力成长</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">💨</span>
              <span className="text-sm text-purple-600 flex-1">飞行速度</span>
              <div className="flex gap-0.5">
                {Array.from({ length: speedAbility?.maxLevel || 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-4 rounded-sm ${
                      i < (speedAbility?.level || 0)
                        ? 'bg-gradient-to-t from-purple-500 to-pink-400'
                        : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-lg">👁️</span>
              <span className="text-sm text-purple-600 flex-1">探索视野</span>
              <div className="flex gap-0.5">
                {Array.from({ length: visibilityAbility?.maxLevel || 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-4 rounded-sm ${
                      i < (visibilityAbility?.level || 0)
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                        : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className={`w-5 h-5 ${dashAbility?.unlocked ? 'text-yellow-500' : 'text-gray-400'}`} />
              <span className={`text-sm flex-1 ${dashAbility?.unlocked ? 'text-purple-600' : 'text-gray-400'}`}>
                极速冲刺
              </span>
              {dashAbility?.unlocked ? (
                <div className="flex gap-0.5">
                  {Array.from({ length: dashAbility.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded-sm ${
                        i < dashAbility.level
                          ? 'bg-gradient-to-t from-yellow-500 to-orange-400'
                          : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400">🔒</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Wind className={`w-5 h-5 ${glideAbility?.unlocked ? 'text-sky-500' : 'text-gray-400'}`} />
              <span className={`text-sm flex-1 ${glideAbility?.unlocked ? 'text-purple-600' : 'text-gray-400'}`}>
                滑翔能力
              </span>
              {glideAbility?.unlocked ? (
                <div className="flex gap-0.5">
                  {Array.from({ length: glideAbility.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded-sm ${
                        i < glideAbility.level
                          ? 'bg-gradient-to-t from-sky-500 to-cyan-400'
                          : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400">🔒</span>
              )}
            </div>
          </div>
          
          {dashAbility?.unlocked && (
            <div className="mt-3 pt-3 border-t border-white/40">
              <div className="flex items-center gap-2 text-xs text-purple-500">
                <span>空格键</span>
                <span>冲刺</span>
                <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-100"
                    style={{ width: `${Math.max(0, 100 - (butterfly.dashCooldown / 60) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {glideAbility?.unlocked && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-purple-500">
                <span>Shift</span>
                <span>滑翔</span>
                <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-100 ${
                      butterfly.isGliding ? 'bg-sky-400' : 'bg-sky-300'
                    }`}
                    style={{ width: `${butterfly.glideEnergy}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Flower2 className="w-5 h-5 text-pink-500" />
            <span className="text-emerald-700 font-medium tracking-wider">花朵图鉴</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-emerald-600">{discovered}</span>
            <span className="text-emerald-400">/</span>
            <span className="text-xl text-emerald-400">{totalFlowers}</span>
          </div>
          <div className="w-40 h-2 bg-white/50 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${flowerProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 pointer-events-auto">
        <button
          onClick={openStoryBook}
          className="flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <BookOpen className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
          <span className="text-purple-700 font-medium tracking-wider">故事集</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold">
            {collected}
          </div>
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 border border-white/40">
          <p className="text-purple-600/70 text-sm tracking-wider">
          WASD / 方向键 控制飞舞 · 空格冲刺 · Shift 滑翔 · 探索迷雾地图 · 收集记忆碎片 · 发现隐藏区域
          </p>
        </div>
      </div>
    </div>
  );
};
