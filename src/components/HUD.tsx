import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { BookOpen, Sparkles, Flower2, Zap, Wind } from 'lucide-react';
import { FLOWER_DATA } from '../data/flowers';
import { CompanionAbility } from '../types/game';

const abilityIcon: Record<CompanionAbility, string> = {
  light: '✨',
  discover: '🔍',
  hint: '💡',
};

export const HUD = () => {
  const { 
    fragments, 
    collectedFragments, 
    discoveredFlowers, 
    openStoryBook,
    abilities,
    butterfly,
    companions,
    activeCompanionId,
    openCompanionPanel,
    triggerHint,
    lastHintTime,
    lightSources,
    giantFlowers,
    hiddenPaths,
    memoryTexts,
    lightMechanisms,
    activeLightId,
    showLightPuzzleHint,
    phantomTrails,
    echoPuzzles,
    showEchoHint,
    echoHintText,
  } = useGameStore();

  const activeCompanion = companions.find(c => c.id === activeCompanionId) || null;
  const unlockedCompanions = companions.filter(c => c.unlocked).length;
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

  const isHintCompanion = activeCompanion?.ability === 'hint';
  const hintCooldownMs = 8000;
  
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const hintCooldownRemaining = Math.max(0, hintCooldownMs - (Date.now() - lastHintTime));
  const canHint = isHintCompanion && hintCooldownRemaining === 0;

  const activeLight = lightSources.find(l => l.id === activeLightId) || null;
  const revealedPaths = hiddenPaths.filter(p => p.revealed).length;
  const revealedTexts = memoryTexts.filter(t => t.revealed).length;
  const activatedMechanisms = lightMechanisms.filter(m => m.activated).length;
  const discoveredGiantFlowers = giantFlowers.filter(f => f.discovered).length;
  const lightColorName: Record<string, string> = { gold: '金光', blue: '蓝光', pink: '粉光' };

  const recordedTrails = phantomTrails.length;
  const playingTrails = phantomTrails.filter(t => t.isPlaying).length;
  const activatedEchoes = echoPuzzles.filter(e => e.activated).length;
  const echoTypeName: Record<string, string> = { memory: '记忆', resonance: '共振', mirror: '镜像' };

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

        <div className="bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔮</span>
            <span className="text-amber-700 font-medium tracking-wider">光影谜题</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs">🌸</span>
              <span className="text-amber-600 flex-1">发现巨花</span>
              <span className="text-amber-500 font-bold">{discoveredGiantFlowers}/{giantFlowers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">🛤️</span>
              <span className="text-amber-600 flex-1">隐藏道路</span>
              <span className="text-amber-500 font-bold">{revealedPaths}/{hiddenPaths.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">📖</span>
              <span className="text-amber-600 flex-1">记忆文字</span>
              <span className="text-amber-500 font-bold">{revealedTexts}/{memoryTexts.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">⚙️</span>
              <span className="text-amber-600 flex-1">光之机关</span>
              <span className="text-amber-500 font-bold">{activatedMechanisms}/{lightMechanisms.length}</span>
            </div>
          </div>
          {activeLight && (
            <div className="mt-3 pt-3 border-t border-white/40">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: activeLight.color === 'gold' ? '#FFD700' : activeLight.color === 'blue' ? '#4DA6FF' : '#FF69B4',
                  }}
                />
                <span className="text-amber-700 font-medium">
                  {lightColorName[activeLight.color]}操控中
                </span>
              </div>
              <div className="flex gap-1 mt-1">
                <span className="text-xs text-amber-600/70 bg-amber-100/50 px-1.5 py-0.5 rounded">Q 左转</span>
                <span className="text-xs text-amber-600/70 bg-amber-100/50 px-1.5 py-0.5 rounded">E 右转</span>
                <span className="text-xs text-amber-600/70 bg-amber-100/50 px-1.5 py-0.5 rounded">L 脱离</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">👻</span>
            <span className="text-purple-700 font-medium tracking-wider">记忆回响</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs">📹</span>
              <span className="text-purple-600 flex-1">已记录轨迹</span>
              <span className="text-purple-500 font-bold">{recordedTrails}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">👻</span>
              <span className="text-purple-600 flex-1">活跃幻影</span>
              <span className="text-purple-500 font-bold">{playingTrails}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">✨</span>
              <span className="text-purple-600 flex-1">回响解谜</span>
              <span className="text-purple-500 font-bold">{activatedEchoes}/{echoPuzzles.length}</span>
            </div>
          </div>
          {showEchoHint && echoHintText && (
            <div className="mt-3 pt-3 border-t border-purple-200/50">
              <p className="text-xs text-purple-600 leading-relaxed">{echoHintText}</p>
            </div>
          )}
          <div className="mt-2 flex gap-1">
            <span className="text-xs text-purple-600/70 bg-purple-100/50 px-1.5 py-0.5 rounded">R 回响</span>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 pointer-events-auto space-y-3">
        <button
          onClick={openStoryBook}
          className="w-full flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <BookOpen className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
          <span className="text-purple-700 font-medium tracking-wider">故事集</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold">
            {collected}
          </div>
        </button>

        <button
          onClick={openCompanionPanel}
          className="w-full flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/60 shadow-lg hover:bg-white/60 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <span className="text-xl">🦋</span>
          <span className="text-purple-700 font-medium tracking-wider">伙伴</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs flex items-center justify-center font-bold">
            {unlockedCompanions}
          </div>
        </button>

        {activeCompanion && (
          <div
            className="rounded-2xl px-4 py-3 border shadow-lg"
            style={{
              backgroundColor: activeCompanion.color + '33',
              borderColor: activeCompanion.color + '66',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🦋</span>
              <span
                className="font-bold text-sm"
                style={{ color: activeCompanion.color }}
              >
                {activeCompanion.name}
              </span>
              <span className="text-xs">携带中</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/80 mb-2">
              <span>{abilityIcon[activeCompanion.ability]}</span>
              <span>+{Math.round(activeCompanion.abilityPower * 100)}%</span>
            </div>
            
            {isHintCompanion && (
              <button
                onClick={triggerHint}
                disabled={!canHint}
                className={`w-full mt-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                  canHint
                    ? 'text-white hover:opacity-90 active:scale-95'
                    : 'bg-gray-400/50 text-white/60 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: canHint ? activeCompanion.color : undefined,
                }}
              >
                {canHint ? (
                  <span className="flex items-center justify-center gap-1">
                    💡 请求提示 (H键)
                  </span>
                ) : (
                  <span>
                    冷却中 {Math.ceil(hintCooldownRemaining / 1000)}s
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 border border-white/40">
          <p className="text-purple-600/70 text-sm tracking-wider">
          WASD / 方向键 控制飞舞 · 空格冲刺 · Shift 滑翔 · B 伙伴 · H 提示 · L 操控光源 · Q/E 旋转光线 · R 回响重播 · 探索迷雾地图 · 收集记忆碎片 · 光影谜题 · 记忆回响
          </p>
        </div>
      </div>
    </div>
  );
};
