import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { Flower, Tree, ButterflyCompanion, DreamRegion, LightSource, GiantFlower, HiddenPath, MemoryText, LightMechanism, PhantomTrail, EchoPuzzle, EmotionHiddenArea } from '../types/game';
import { BASE_ACCEL, FRAGMENT_RESPAWN_INTERVAL } from '../store/gameStore';
import { LIGHT_COLOR_MAP } from '../data/lightPuzzle';
import { EMOTIONS, EMOTION_COMBINATIONS } from '../data/emotions';

const DECORATIVE_FLOWER_COUNT = 80;
const TREE_COUNT = 18;

const generateDecorativeFlowers = (): Flower[] => {
  const flowers: Flower[] = [];
  const colors = ['#FFB6C8', '#FFD93D', '#FF9ECD', '#A8E6CF', '#FFE66D', '#FF6B9D', '#C9B1FF'];
  for (let i = 0; i < DECORATIVE_FLOWER_COUNT; i++) {
    flowers.push({
      id: `decorative-${i}`,
      x: Math.random() * 2400,
      y: Math.random() * 1800,
      size: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      petalCount: 5 + Math.floor(Math.random() * 3),
      swayPhase: Math.random() * Math.PI * 2,
      type: 'decorative',
      name: '',
      unlocked: true,
      discovered: true,
      unlockCondition: '',
      memory: '',
      knowledge: '',
      flowerLanguage: '',
      bloomPhase: 1,
      pulsePhase: 0,
    });
  }
  return flowers;
};

const generateTrees = (): Tree[] => {
  const trees: Tree[] = [];
  const types: Tree['type'][] = ['round', 'pine', 'cherry'];
  for (let i = 0; i < TREE_COUNT; i++) {
    trees.push({
      x: 100 + Math.random() * 2200,
      y: 100 + Math.random() * 1600,
      size: 50 + Math.random() * 40,
      type: types[Math.floor(Math.random() * types.length)],
    });
  }
  return trees;
};

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const decorativeFlowersRef = useRef<Flower[]>(generateDecorativeFlowers());
  const treesRef = useRef<Tree[]>(generateTrees());
  const timeRef = useRef(0);
  const hoveredFlowerIdRef = useRef<string | null>(null);

  const {
    butterfly,
    fragments,
    particles,
    petals,
    fireflies,
    flowers,
    cameraX,
    cameraY,
    isPlaying,
    viewportWidth,
    viewportHeight,
    mapWidth,
    mapHeight,
    fogGrid,
    fogCellSize,
    hiddenAreas,
    abilities,
    companions,
    activeCompanionId,
    companionParticles,
    dreamRegions,
    dreamDecorations,
    dynamicParticles,
    mapBounds,
    setButterflyVelocity,
    updateButterfly,
    updateFragments,
    checkFragmentCollision,
    updateParticles,
    updatePetals,
    updateFireflies,
    updateFlowers,
    updateCamera,
    setViewport,
    updateFog,
    spawnRandomFragments,
    openFlowerCard,
    discoverFlower,
    checkFlowerUnlocks,
    spawnCollectParticles,
    dash,
    setGliding,
    updateAbilityLevels,
    checkAbilityUnlocks,
    checkHiddenAreaDiscovery,
    updateCompanions,
    updateCompanionEncounterProgress,
    checkCompanionEncounters,
    checkCompanionProximity,
    updateCompanionParticles,
    openCompanionPanel,
    triggerHint,
    updateDreamDecorations,
    spawnDynamicParticles,
    updateDynamicParticles,
    updateRegionAnimation,
    lightSources,
    giantFlowers,
    hiddenPaths,
    memoryTexts,
    lightMechanisms,
    activeLightId,
    showLightPuzzleHint,
    updateLightSources,
    updateGiantFlowers,
    updateLightPuzzleLogic,
    setActiveLight,
    rotateLight,
    interactWithLight,
    interactWithNearestLight,
    findNearestLight,
    checkGiantFlowerDiscovery,
    phantomTrails,
    echoPuzzles,
    echoParticles,
    showEchoHint,
    echoHintText,
    recordPhantomSnapshot,
    updatePhantomTrails,
    checkEchoPuzzles,
    updateEchoPuzzles,
    updateEchoParticles,
    triggerEchoReplay,
    emotionCounts,
    currentMoodColors,
    emotionHiddenAreas,
    unlockedCombinations,
    activeCombinationId,
    updateMoodTransition,
    checkEmotionAreaDiscovery,
    openEmotionGarden,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);
      
      if (key === ' ' && !e.repeat) {
        e.preventDefault();
        dash();
      }
      
      if (key === 'shift') {
        setGliding(true);
      }
      
      if (key === 'b' && !e.repeat) {
        e.preventDefault();
        openCompanionPanel();
      }
      
      if (key === 'h' && !e.repeat) {
        e.preventDefault();
        triggerHint();
      }

      if (key === 'q') {
        e.preventDefault();
        rotateLight(-0.08);
      }
      if (key === 'e') {
        e.preventDefault();
        rotateLight(0.08);
      }
      if (key === 'l' && !e.repeat) {
        e.preventDefault();
        interactWithNearestLight();
      }
      if (key === 'r' && !e.repeat) {
        e.preventDefault();
        const { phantomTrails: trails } = useGameStore.getState();
        const playingTrail = trails.find(t => t.isPlaying);
        if (!playingTrail && trails.length > 0) {
          const lastTrail = trails[trails.length - 1];
          triggerEchoReplay(lastTrail.id);
        }
      }
      
      if (key === 'g' && !e.repeat) {
        e.preventDefault();
        openEmotionGarden();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);
      
      if (key === 'shift') {
        setGliding(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dash, setGliding, openCompanionPanel, triggerHint, rotateLight, interactWithNearestLight, triggerEchoReplay, openEmotionGarden]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setViewport(window.innerWidth, window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setViewport]);

  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const offsetX = viewportWidth / 2 - cameraX;
    const offsetY = viewportHeight / 2 - cameraY;
    return {
      x: screenX - offsetX,
      y: screenY - offsetY,
    };
  }, [cameraX, cameraY, viewportWidth, viewportHeight]);

  const getFlowerAtPosition = useCallback((worldX: number, worldY: number): Flower | null => {
    for (const flower of flowers) {
      if (flower.type === 'decorative') continue;
      const dx = worldX - flower.x;
      const dy = worldY - flower.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < flower.size * 1.5) {
        return flower;
      }
    }
    return null;
  }, [flowers]);

  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    const flower = getFlowerAtPosition(worldPos.x, worldPos.y);

    if (flower && flower.unlocked) {
      if (!flower.discovered) {
        discoverFlower(flower.id);
        spawnCollectParticles(flower.x, flower.y, flower.color);
      }
      openFlowerCard(flower.id);
    }
  }, [isPlaying, screenToWorld, getFlowerAtPosition, openFlowerCard, discoverFlower, spawnCollectParticles]);

  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    const flower = getFlowerAtPosition(worldPos.x, worldPos.y);

    if (flower && flower.unlocked) {
      canvas.style.cursor = 'pointer';
      hoveredFlowerIdRef.current = flower.id;
    } else {
      canvas.style.cursor = 'default';
      hoveredFlowerIdRef.current = null;
    }
  }, [isPlaying, screenToWorld, getFlowerAtPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    };
  }, [handleCanvasClick, handleCanvasMouseMove]);

  const handleInput = () => {
    let dx = 0;
    let dy = 0;
    const keys = keysRef.current;
    if (keys.has('arrowup') || keys.has('w')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) dy += 1;
    if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d')) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
      setButterflyVelocity(butterfly.vx + dx * BASE_ACCEL, butterfly.vy + dy * BASE_ACCEL);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      spawnRandomFragments();
    }, FRAGMENT_RESPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [isPlaying, spawnRandomFragments]);

  const gameLoop = () => {
    if (!isPlaying) return;
    timeRef.current += 0.016;
    handleInput();
    updateButterfly();
    updateFragments();
    checkFragmentCollision();
    updateFlowers();
    checkFlowerDiscovery();
    checkFlowerUnlocks();
    updateAbilityLevels();
    checkAbilityUnlocks();
    checkHiddenAreaDiscovery();
    updateCompanions();
    updateCompanionEncounterProgress();
    checkCompanionEncounters();
    checkCompanionProximity();
    updateCompanionParticles();
    updateDreamDecorations();
    spawnDynamicParticles();
    updateDynamicParticles();
    updateRegionAnimation();
    updateLightSources();
    updateGiantFlowers();
    updateLightPuzzleLogic();
    checkGiantFlowerDiscovery();
    recordPhantomSnapshot();
    updatePhantomTrails();
    checkEchoPuzzles();
    updateEchoPuzzles();
    updateEchoParticles();
    updateMoodTransition();
    checkEmotionAreaDiscovery();
    if (Math.random() < 0.008) {
      triggerHint();
    }
    updateParticles();
    updatePetals();
    updateFireflies();
    updateCamera();
    updateFog();
    render();
  };

  useGameLoop(gameLoop, isPlaying);

  const checkFlowerDiscovery = () => {
    for (const flower of flowers) {
      if (flower.type === 'decorative') continue;
      if (!flower.unlocked || flower.discovered) continue;
      
      const dx = butterfly.x - flower.x;
      const dy = butterfly.y - flower.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < flower.size * 2 + 20) {
        discoverFlower(flower.id);
        spawnCollectParticles(flower.x, flower.y, flower.color);
        openFlowerCard(flower.id);
      }
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    const offsetX = viewportWidth / 2 - cameraX;
    const offsetY = viewportHeight / 2 - cameraY;

    drawGround(ctx, offsetX, offsetY);
    drawDreamRegions(ctx, offsetX, offsetY);
    drawPath(ctx, offsetX, offsetY);
    drawDreamDecorations(ctx, offsetX, offsetY);
    drawEmotionHiddenAreas(ctx, offsetX, offsetY);
    drawHiddenAreas(ctx, offsetX, offsetY);
    drawHiddenPaths(ctx, offsetX, offsetY);
    drawLightBeams(ctx, offsetX, offsetY);
    drawLightMechanisms(ctx, offsetX, offsetY);
    drawEchoPuzzles(ctx, offsetX, offsetY);
    drawPhantomTrails(ctx, offsetX, offsetY);
    drawEchoParticles(ctx, offsetX, offsetY);
    drawMemoryTexts(ctx, offsetX, offsetY);
    drawTrees(ctx, offsetX, offsetY);
    drawFlowers(ctx, offsetX, offsetY);
    drawGiantFlowers(ctx, offsetX, offsetY);
    drawLightSources(ctx, offsetX, offsetY);
    drawDynamicParticles(ctx, offsetX, offsetY);
    drawUnlockedCompanions(ctx, offsetX, offsetY);
    drawLockedCompanions(ctx, offsetX, offsetY);
    drawFireflies(ctx, offsetX, offsetY);
    drawFragments(ctx, offsetX, offsetY);
    drawPetals(ctx, offsetX, offsetY);
    drawButterfly(ctx, offsetX, offsetY);
    drawParticles(ctx, offsetX, offsetY);
    drawCompanionParticles(ctx, offsetX, offsetY);
    drawMapBorder(ctx, offsetX, offsetY);
    drawFog(ctx, offsetX, offsetY);
  };

  const drawGround = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, viewportHeight);
    gradient.addColorStop(0, currentMoodColors.groundStart);
    gradient.addColorStop(0.5, currentMoodColors.groundMid);
    gradient.addColorStop(1, currentMoodColors.groundEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    ctx.fillStyle = 'rgba(77, 167, 108, 0.15)';
    for (let i = 0; i < 60; i++) {
      const gx = ((i * 137) % mapWidth) + ox;
      const gy = ((i * 89) % mapHeight) + oy;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 30 + (i % 3) * 10, 20 + (i % 2) * 8, i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawEmotionHiddenAreas = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const area of emotionHiddenAreas) {
      const x = area.x + ox;
      const y = area.y + oy;
      
      if (x + area.width < -100 || x > viewportWidth + 100 || 
          y + area.height < -100 || y > viewportHeight + 100) continue;

      const relatedCombo = EMOTION_COMBINATIONS.find(c => c.unlocksHiddenAreaId === area.id);
      const isComboUnlocked = relatedCombo ? unlockedCombinations.includes(relatedCombo.id) : false;
      const isActiveCombo = activeCombinationId === relatedCombo?.id;
      const time = timeRef.current;

      ctx.save();
      
      if (area.discovered || isComboUnlocked) {
        const pulseIntensity = isActiveCombo ? (Math.sin(time * 3) + 1) / 2 : (Math.sin(time) + 1) / 2;
        
        const gradient = ctx.createRadialGradient(
          x + area.width / 2, y + area.height / 2, 0,
          x + area.width / 2, y + area.height / 2, Math.max(area.width, area.height) / 2
        );
        gradient.addColorStop(0, area.themeColor + (isActiveCombo ? '88' : '55'));
        gradient.addColorStop(0.5, area.themeColor + '33');
        gradient.addColorStop(1, area.themeColor + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 40, y - 40, area.width + 80, area.height + 80);

        drawEmotionAreaDecoration(ctx, area, x, y, time, pulseIntensity);

        const borderAlpha = isActiveCombo ? 'CC' : '88';
        const borderGradient = ctx.createLinearGradient(x, y, x + area.width, y + area.height);
        borderGradient.addColorStop(0, area.themeColor + borderAlpha);
        borderGradient.addColorStop(0.5, '#FFFFFF' + borderAlpha);
        borderGradient.addColorStop(1, area.themeColor + borderAlpha);
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = isActiveCombo ? 4 : 3;
        ctx.setLineDash([12, 6]);
        ctx.lineDashOffset = time * 12 * (isActiveCombo ? 1 : -1);
        ctx.strokeRect(x, y, area.width, area.height);
        ctx.setLineDash([]);

        ctx.fillStyle = area.themeColor;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(area.name, x + area.width / 2, y + area.height / 2 - 10);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '13px sans-serif';
        ctx.fillText(area.description, x + area.width / 2, y + area.height / 2 + 15);

        if (isActiveCombo) {
          for (let i = 0; i < 8; i++) {
            const angle = time * 2 + (Math.PI * 2 * i) / 8;
            const dist = Math.max(area.width, area.height) / 2 + 15 + Math.sin(time * 3 + i) * 8;
            const px = x + area.width / 2 + Math.cos(angle) * dist;
            const py = y + area.height / 2 + Math.sin(angle) * dist;
            ctx.fillStyle = area.themeColor + 'CC';
            ctx.beginPath();
            ctx.arc(px, py, 3 + pulseIntensity * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (isComboUnlocked) {
        const hintAlpha = 0.12 + Math.sin(time * 1.5) * 0.08;
        ctx.fillStyle = area.themeColor + Math.floor(hintAlpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(x, y, area.width, area.height);
        
        ctx.strokeStyle = area.themeColor + '33';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, area.width, area.height);
        ctx.setLineDash([]);

        ctx.fillStyle = area.themeColor + '88';
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✦', x + area.width / 2, y + area.height / 2);
      }
      
      ctx.restore();
    }
  };

  const drawEmotionAreaDecoration = (
    ctx: CanvasRenderingContext2D, 
    area: EmotionHiddenArea, 
    x: number, y: number, 
    time: number, 
    pulse: number
  ) => {
    const cx = x + area.width / 2;
    const cy = y + area.height / 2;

    switch (area.decoration) {
      case 'starry':
        for (let i = 0; i < 30; i++) {
          const sx = x + 20 + (i * 37) % (area.width - 40);
          const sy = y + 20 + (i * 53) % (area.height - 40);
          const twinkle = Math.sin(time * 3 + i) * 0.4 + 0.6;
          ctx.globalAlpha = twinkle;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5 + twinkle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
      
      case 'crystal':
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12 + time * 0.5;
          const cr = Math.min(area.width, area.height) * 0.3;
          const crystalX = cx + Math.cos(angle) * cr;
          const crystalY = cy + Math.sin(angle) * cr;
          const size = 8 + pulse * 4;
          ctx.save();
          ctx.translate(crystalX, crystalY);
          ctx.rotate(angle);
          ctx.fillStyle = area.themeColor + 'AA';
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.6, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.moveTo(0, -size * 0.6);
          ctx.lineTo(size * 0.3, 0);
          ctx.lineTo(0, size * 0.2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        break;
      
      case 'rose':
        for (let i = 0; i < 7; i++) {
          const angle = (Math.PI * 2 * i) / 7 + time * 0.3;
          const r = 25 + i * 12;
          const roseX = cx + Math.cos(angle + time * 0.2) * r * 0.4;
          const roseY = cy + Math.sin(angle + time * 0.2) * r * 0.4;
          const petalSize = 10 + i * 2 + pulse * 3;
          ctx.fillStyle = area.themeColor + (90 - i * 8).toString(16).padStart(2, '0');
          for (let j = 0; j < 6; j++) {
            const petalAngle = (Math.PI * 2 * j) / 6;
            ctx.save();
            ctx.translate(roseX, roseY);
            ctx.rotate(petalAngle + time * 0.1);
            ctx.beginPath();
            ctx.ellipse(0, -petalSize * 0.5, petalSize * 0.4, petalSize * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        break;
      
      case 'ocean':
        for (let i = 0; i < 5; i++) {
          const wavePhase = time * 2 + i * 0.8;
          const waveY = cy + Math.sin(wavePhase) * 20 + i * 25 - 50;
          ctx.strokeStyle = area.themeColor + (40 + i * 10).toString(16).padStart(2, '0');
          ctx.lineWidth = 2 + i;
          ctx.beginPath();
          for (let wx = 0; wx <= area.width; wx += 10) {
            const wy = waveY + Math.sin(wx * 0.04 + wavePhase) * 8;
            if (wx === 0) ctx.moveTo(x + wx, wy);
            else ctx.lineTo(x + wx, wy);
          }
          ctx.stroke();
        }
        break;
      
      case 'aurora':
        for (let i = 0; i < 6; i++) {
          const auroraPhase = time * 0.8 + i * 0.5;
          const gradient = ctx.createLinearGradient(x, y + i * area.height / 8, x + area.width, y + (i + 2) * area.height / 8);
          const colors = ['#9B7EDC', '#87CEEB', '#FF6B9D', '#FFD93D', '#A8E6CF', area.themeColor];
          gradient.addColorStop(0, colors[i % colors.length] + '00');
          gradient.addColorStop(0.3 + Math.sin(auroraPhase) * 0.1, colors[i % colors.length] + Math.floor(30 + pulse * 20).toString(16).padStart(2, '0'));
          gradient.addColorStop(0.7 + Math.cos(auroraPhase) * 0.1, colors[(i + 2) % colors.length] + Math.floor(20 + pulse * 15).toString(16).padStart(2, '0'));
          gradient.addColorStop(1, colors[(i + 1) % colors.length] + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          for (let ax = 0; ax <= area.width; ax += 5) {
            const ay = y + area.height / 2 + Math.sin(ax * 0.03 + auroraPhase + i) * (30 + i * 8) + i * 5 - 30;
            if (ax === 0) ctx.moveTo(x + ax, ay);
            else ctx.lineTo(x + ax, ay);
          }
          for (let ax = area.width; ax >= 0; ax -= 5) {
            const ay = y + area.height / 2 + Math.sin(ax * 0.03 + auroraPhase + i) * (30 + i * 8) + i * 5 - 10;
            ctx.lineTo(x + ax, ay);
          }
          ctx.closePath();
          ctx.fill();
        }
        break;
      
      case 'ember':
        for (let i = 0; i < 25; i++) {
          const ex = x + 30 + (i * 47) % (area.width - 60);
          const baseY = y + 30 + (i * 61) % (area.height - 60);
          const floatOffset = (time * 30 + i * 20) % (area.height - 60);
          const ey = baseY - floatOffset + (floatOffset > area.height - 60 - baseY ? (area.height - 60) : 0);
          const emberPulse = Math.sin(time * 5 + i) * 0.3 + 0.7;
          const size = 2 + emberPulse * 2;
          ctx.globalAlpha = 0.5 + emberPulse * 0.5;
          const emberGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, size * 4);
          emberGlow.addColorStop(0, '#FFD700');
          emberGlow.addColorStop(0.3, area.themeColor);
          emberGlow.addColorStop(1, area.themeColor + '00');
          ctx.fillStyle = emberGlow;
          ctx.beginPath();
          ctx.arc(ex, ey, size * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFAA';
          ctx.beginPath();
          ctx.arc(ex, ey, size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
    }
  };

  const drawDreamRegions = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const region of dreamRegions) {
      if (!region.unlocked) continue;

      const x = region.x + ox;
      const y = region.y + oy;
      
      if (x + region.width < -100 || x > viewportWidth + 100 || 
          y + region.height < -100 || y > viewportHeight + 100) continue;

      const animPhase = region.animationPhase ?? 1;

      ctx.save();

      if (animPhase < 1) {
        ctx.save();
        ctx.beginPath();
        const cx = x + region.width / 2;
        const cy = y + region.height / 2;
        const maxRadius = Math.max(region.width, region.height);
        ctx.arc(cx, cy, maxRadius * animPhase, 0, Math.PI * 2);
        ctx.clip();
      }

      const gradient = ctx.createRadialGradient(
        x + region.width / 2, y + region.height / 2, 0,
        x + region.width / 2, y + region.height / 2, Math.max(region.width, region.height) / 2
      );
      gradient.addColorStop(0, region.bgColor + 'AA');
      gradient.addColorStop(0.6, region.bgColor + '66');
      gradient.addColorStop(1, region.bgColor + '00');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 30, y - 30, region.width + 60, region.height + 60);

      const borderGradient = ctx.createLinearGradient(x, y, x + region.width, y + region.height);
      borderGradient.addColorStop(0, region.themeColor + '88');
      borderGradient.addColorStop(0.5, region.themeColor + '44');
      borderGradient.addColorStop(1, region.themeColor + '88');
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 4;
      ctx.setLineDash([15, 8]);
      ctx.lineDashOffset = timeRef.current * 10;
      ctx.strokeRect(x, y, region.width, region.height);
      ctx.setLineDash([]);

      drawRegionTerrain(ctx, region, x, y);

      ctx.fillStyle = region.themeColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(region.name, x + region.width / 2, y + 35);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '13px sans-serif';
      ctx.fillText(region.description, x + region.width / 2, y + 55);

      if (animPhase < 1) {
        ctx.restore();
        const cx = x + region.width / 2;
        const cy = y + region.height / 2;
        const maxRadius = Math.max(region.width, region.height);
        const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * animPhase);
        glowGradient.addColorStop(0, region.themeColor + Math.floor((1 - animPhase) * 200).toString(16).padStart(2, '0'));
        glowGradient.addColorStop(1, region.themeColor + '00');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - 100, y - 100, region.width + 200, region.height + 200);
      }
      
      ctx.restore();
    }
  };

  const drawRegionTerrain = (ctx: CanvasRenderingContext2D, region: DreamRegion, x: number, y: number) => {
    const time = timeRef.current;

    switch (region.terrainType) {
      case 'garden':
        drawGardenTerrain(ctx, region, x, y, time);
        break;
      case 'field':
        drawFieldTerrain(ctx, region, x, y, time);
        break;
      case 'valley':
        drawValleyTerrain(ctx, region, x, y, time);
        break;
      case 'lake':
        drawLakeTerrain(ctx, region, x, y, time);
        break;
      case 'bridge':
        drawBridgeTerrain(ctx, region, x, y, time);
        break;
    }
  };

  const drawGardenTerrain = (ctx: CanvasRenderingContext2D, region: DreamRegion, x: number, y: number, time: number) => {
    for (let i = 0; i < 8; i++) {
      const fx = x + 50 + (i * (region.width - 100)) / 7;
      const fy = y + region.height - 60 + Math.sin(time + i) * 5;
      const flowerSize = 20 + Math.sin(time * 2 + i * 0.5) * 3;

      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy + flowerSize);
      ctx.quadraticCurveTo(fx + Math.sin(time + i) * 3, fy + flowerSize * 0.5, fx, fy);
      ctx.stroke();

      ctx.fillStyle = region.themeColor;
      for (let j = 0; j < 5; j++) {
        const angle = (Math.PI * 2 * j) / 5 + time * 0.2;
        const px = fx + Math.cos(angle) * flowerSize * 0.4;
        const py = fy + Math.sin(angle) * flowerSize * 0.4;
        ctx.beginPath();
        ctx.ellipse(px, py, flowerSize * 0.3, flowerSize * 0.2, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(fx, fy, flowerSize * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawFieldTerrain = (ctx: CanvasRenderingContext2D, region: DreamRegion, x: number, y: number, time: number) => {
    for (let i = 0; i < 10; i++) {
      const fx = x + 40 + (i * (region.width - 80)) / 9;
      const fy = y + region.height - 80 + Math.sin(time * 1.5 + i * 0.8) * 8;
      const stemHeight = 60 + Math.sin(time + i) * 5;

      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fx, fy + stemHeight + 20);
      ctx.quadraticCurveTo(fx + Math.sin(time + i) * 5, fy + stemHeight / 2, fx, fy);
      ctx.stroke();

      const headSize = 25 + Math.sin(time * 1.5 + i) * 3;
      ctx.fillStyle = region.themeColor;
      for (let j = 0; j < 12; j++) {
        const angle = (Math.PI * 2 * j) / 12;
        const px = fx + Math.cos(angle) * headSize * 0.5;
        const py = fy + Math.sin(angle) * headSize * 0.5;
        ctx.beginPath();
        ctx.ellipse(px, py, headSize * 0.4, headSize * 0.2, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(fx, fy, headSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawValleyTerrain = (ctx: CanvasRenderingContext2D, region: DreamRegion, x: number, y: number, time: number) => {
    const waveOffset = Math.sin(time * 0.8) * 5;

    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x, y + region.height);
    ctx.lineTo(x + region.width * 0.3, y + region.height * 0.4 + waveOffset);
    ctx.lineTo(x + region.width * 0.5, y + region.height * 0.6 - waveOffset);
    ctx.lineTo(x + region.width * 0.7, y + region.height * 0.3 + waveOffset * 0.5);
    ctx.lineTo(x + region.width, y + region.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(139, 69, 19, 0.2)';
    ctx.beginPath();
    ctx.moveTo(x, y + region.height);
    ctx.lineTo(x + region.width * 0.2, y + region.height * 0.5 - waveOffset * 0.7);
    ctx.lineTo(x + region.width * 0.4, y + region.height * 0.7 + waveOffset * 0.5);
    ctx.lineTo(x + region.width * 0.6, y + region.height * 0.45 - waveOffset * 0.3);
    ctx.lineTo(x + region.width * 0.8, y + region.height * 0.6 + waveOffset * 0.6);
    ctx.lineTo(x + region.width, y + region.height);
    ctx.closePath();
    ctx.fill();
  };

  const drawLakeTerrain = (ctx: CanvasRenderingContext2D, region: DreamRegion, x: number, y: number, time: number) => {
    const lakeX = x + region.width * 0.15;
    const lakeY = y + region.height * 0.4;
    const lakeW = region.width * 0.7;
    const lakeH = region.height * 0.5;

    const waterGradient = ctx.createRadialGradient(
      lakeX + lakeW / 2, lakeY + lakeH / 2, 0,
      lakeX + lakeW / 2, lakeY + lakeH / 2, Math.max(lakeW, lakeH) / 2
    );
    waterGradient.addColorStop(0, '#87CEEB');
    waterGradient.addColorStop(0.5, '#5DADE2');
    waterGradient.addColorStop(1, '#3498DB');
    ctx.fillStyle = waterGradient;
    ctx.beginPath();
    ctx.ellipse(lakeX + lakeW / 2, lakeY + lakeH / 2, lakeW / 2, lakeH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ripplePhase = (time * 0.5 + i * 0.7) % 1;
      const rippleSize = ripplePhase * Math.min(lakeW, lakeH) * 0.4;
      ctx.globalAlpha = 1 - ripplePhase;
      ctx.beginPath();
      ctx.ellipse(
        lakeX + lakeW / 2, 
        lakeY + lakeH / 2, 
        rippleSize * 1.2, 
        rippleSize * 0.8, 
        0, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const drawBridgeTerrain = (ctx: CanvasRenderingContext2D, region: DreamRegion, x: number, y: number, time: number) => {
    const colors = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#4DABF7', '#9B7EDC'];
    const bridgeY = y + region.height * 0.5;
    const bridgeHeight = 40;

    for (let i = 0; i < colors.length; i++) {
      const offset = (i - colors.length / 2) * bridgeHeight * 0.3;
      const color = colors[i];
      
      ctx.strokeStyle = color;
      ctx.lineWidth = bridgeHeight / colors.length;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 30, bridgeY + offset);
      ctx.quadraticCurveTo(
        x + region.width / 2, 
        bridgeY - 80 + offset,
        x + region.width - 30, 
        bridgeY + offset
      );
      ctx.stroke();
    }

    const glowIntensity = (Math.sin(time * 2) + 1) / 2;
    const glowGradient = ctx.createRadialGradient(
      x + region.width / 2, bridgeY - 40, 0,
      x + region.width / 2, bridgeY - 40, 100 + glowIntensity * 30
    );
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(
      x + region.width / 2 - 150, 
      bridgeY - 150, 
      300, 
      200
    );
  };

  const drawDreamDecorations = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const deco of dreamDecorations) {
      const x = deco.x + ox;
      const y = deco.y + oy;
      
      if (x < -80 || x > viewportWidth + 80 || y < -80 || y > viewportHeight + 80) continue;

      const sway = Math.sin(deco.phase) * 2;

      ctx.save();
      
      switch (deco.type) {
        case 'tree':
          ctx.fillStyle = '#8B6914';
          ctx.fillRect(x - 4, y, 8, deco.size * 0.5);
          ctx.fillStyle = deco.color;
          ctx.beginPath();
          ctx.arc(x + sway, y - deco.size * 0.2, deco.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'flower':
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y + deco.size * 0.5);
          ctx.quadraticCurveTo(x + sway, y + deco.size * 0.25, x + sway, y);
          ctx.stroke();
          ctx.fillStyle = deco.color;
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 + deco.phase;
            const px = x + sway + Math.cos(angle) * deco.size * 0.3;
            const py = y + Math.sin(angle) * deco.size * 0.3;
            ctx.beginPath();
            ctx.ellipse(px, py, deco.size * 0.2, deco.size * 0.12, angle, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#FFD93D';
          ctx.beginPath();
          ctx.arc(x + sway, y, deco.size * 0.15, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rock':
          ctx.fillStyle = '#808080';
          ctx.beginPath();
          ctx.ellipse(x, y, deco.size * 0.4, deco.size * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#A0A0A0';
          ctx.beginPath();
          ctx.ellipse(x - deco.size * 0.1, y - deco.size * 0.05, deco.size * 0.2, deco.size * 0.12, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'bush':
          ctx.fillStyle = deco.color;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(x, y, deco.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x - deco.size * 0.25, y + deco.size * 0.1, deco.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + deco.size * 0.25, y + deco.size * 0.1, deco.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
      }
      
      ctx.restore();
    }
  };

  const drawDynamicParticles = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const p of dynamicParticles) {
      const x = p.x + ox;
      const y = p.y + oy;
      
      if (x < -50 || x > viewportWidth + 50 || y < -50 || y > viewportHeight + 50) continue;

      const lifeRatio = p.life / p.maxLife;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = lifeRatio;

      switch (p.type) {
        case 'petals':
        case 'leaves':
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.ellipse(-p.size * 0.2, -p.size * 0.1, p.size * 0.4, p.size * 0.2, 0.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'snowflakes':
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        case 'bloom':
        case 'sway':
        case 'rainbow': {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = lifeRatio * 0.6;
          const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 3);
          glow.addColorStop(0, p.color);
          glow.addColorStop(1, p.color + '00');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.strokeStyle = '#D4B896';
    ctx.lineWidth = 60;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 900);
    ctx.quadraticCurveTo(600, 700, 1200, 900);
    ctx.quadraticCurveTo(1800, 1100, 2400, 900);
    ctx.stroke();

    ctx.strokeStyle = '#E8D4B8';
    ctx.lineWidth = 50;
    ctx.beginPath();
    ctx.moveTo(0, 900);
    ctx.quadraticCurveTo(600, 700, 1200, 900);
    ctx.quadraticCurveTo(1800, 1100, 2400, 900);
    ctx.stroke();
    ctx.restore();
  };

  const drawHiddenAreas = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const area of hiddenAreas) {
      const x = area.x + ox;
      const y = area.y + oy;
      
      if (x + area.width < -100 || x > viewportWidth + 100 || 
          y + area.height < -100 || y > viewportHeight + 100) continue;

      const ability = abilities.find(a => a.id === area.requiredAbility);
      const canDiscover = ability && ability.unlocked;
      
      ctx.save();
      
      if (area.discovered) {
        const gradient = ctx.createRadialGradient(
          x + area.width / 2, y + area.height / 2, 0,
          x + area.width / 2, y + area.height / 2, Math.max(area.width, area.height) / 2
        );
        gradient.addColorStop(0, area.color + '44');
        gradient.addColorStop(0.5, area.color + '22');
        gradient.addColorStop(1, area.color + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 30, y - 30, area.width + 60, area.height + 60);

        ctx.strokeStyle = area.color + 'AA';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(x, y, area.width, area.height);
        ctx.setLineDash([]);

        const pulseScale = 1 + Math.sin(timeRef.current * 2) * 0.05;
        ctx.save();
        ctx.translate(x + area.width / 2, y + area.height / 2);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-(x + area.width / 2), -(y + area.height / 2));
        
        const borderGradient = ctx.createLinearGradient(x, y, x + area.width, y + area.height);
        borderGradient.addColorStop(0, area.color);
        borderGradient.addColorStop(0.5, '#FFFFFF');
        borderGradient.addColorStop(1, area.color);
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, y + 5, area.width - 10, area.height - 10);
        ctx.restore();

        ctx.fillStyle = area.color;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(area.name, x + area.width / 2, y + area.height / 2);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px sans-serif';
        ctx.fillText(area.description, x + area.width / 2, y + area.height / 2 + 25);
      } else if (canDiscover) {
        const hintAlpha = 0.15 + Math.sin(timeRef.current * 1.5) * 0.1;
        ctx.fillStyle = area.color + Math.floor(hintAlpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(x, y, area.width, area.height);
        
        ctx.strokeStyle = area.color + '44';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, area.width, area.height);
        ctx.setLineDash([]);

        ctx.fillStyle = area.color + 'AA';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', x + area.width / 2, y + area.height / 2 + 8);
      }
      
      ctx.restore();
    }
  };

  const drawTrees = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const tree of treesRef.current) {
      const x = tree.x + ox;
      const y = tree.y + oy;
      if (x < -150 || x > viewportWidth + 150 || y < -150 || y > viewportHeight + 150) continue;

      ctx.fillStyle = '#8B6914';
      ctx.fillRect(x - 8, y, 16, tree.size * 0.5);

      if (tree.type === 'round') {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y - tree.size * 0.2, tree.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#66BB6A';
        ctx.beginPath();
        ctx.arc(x - tree.size * 0.2, y - tree.size * 0.3, tree.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + tree.size * 0.2, y - tree.size * 0.3, tree.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (tree.type === 'pine') {
        ctx.fillStyle = '#2E7D32';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y - tree.size * 0.2 - i * tree.size * 0.3);
          ctx.lineTo(x - tree.size * 0.5 + i * 8, y - i * tree.size * 0.2);
          ctx.lineTo(x + tree.size * 0.5 - i * 8, y - i * tree.size * 0.2);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#FFB6C8';
        ctx.beginPath();
        ctx.arc(x, y - tree.size * 0.2, tree.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFC0CB';
        ctx.beginPath();
        ctx.arc(x - tree.size * 0.25, y - tree.size * 0.35, tree.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + tree.size * 0.25, y - tree.size * 0.35, tree.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 6; i++) {
          const px = x + Math.cos(i + timeRef.current * 0.5) * tree.size * 0.5;
          const py = y - tree.size * 0.3 + Math.sin(i + timeRef.current * 0.3) * tree.size * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  const drawFlower = (ctx: CanvasRenderingContext2D, flower: Flower, ox: number, oy: number, isInteractive: boolean = false) => {
    const x = flower.x + ox;
    const y = flower.y + oy;
    if (x < -80 || x > viewportWidth + 80 || y < -80 || y > viewportHeight + 80) return;

    const sway = Math.sin(timeRef.current * 2 + flower.swayPhase) * 2;
    const pulse = isInteractive ? (Math.sin(flower.pulsePhase) + 1) * 0.1 + 1 : 1;
    const isHovered = hoveredFlowerIdRef.current === flower.id;
    const scale = isHovered ? 1.2 : 1;
    const bloomScale = flower.bloomPhase || 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * bloomScale, scale * bloomScale);
    ctx.translate(-x, -y);

    if (isInteractive && flower.unlocked) {
      const glowIntensity = (Math.sin(flower.pulsePhase * 0.5) + 1) / 2;
      const glowRadius = flower.size * (2 + glowIntensity);
      const gradient = ctx.createRadialGradient(x + sway, y, 0, x + sway, y, glowRadius);
      gradient.addColorStop(0, flower.color + '66');
      gradient.addColorStop(0.5, flower.color + '22');
      gradient.addColorStop(1, flower.color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x + sway, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = flower.unlocked ? '#4CAF50' : '#6B7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + flower.size * pulse);
    ctx.quadraticCurveTo(x + sway, y + flower.size * 0.5 * pulse, x + sway, y);
    ctx.stroke();

    if (flower.unlocked) {
      ctx.fillStyle = flower.color;
    } else {
      ctx.fillStyle = '#9CA3AF';
      ctx.globalAlpha = 0.5;
    }
    
    for (let i = 0; i < flower.petalCount; i++) {
      const angle = (Math.PI * 2 * i) / flower.petalCount;
      const px = x + sway + Math.cos(angle) * flower.size * 0.4 * pulse;
      const py = y + Math.sin(angle) * flower.size * 0.4 * pulse;
      ctx.beginPath();
      ctx.ellipse(px, py, flower.size * 0.3, flower.size * 0.2, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    
    if (flower.unlocked) {
      ctx.fillStyle = '#FFD93D';
    } else {
      ctx.fillStyle = '#6B7280';
    }
    ctx.beginPath();
    ctx.arc(x + sway, y, flower.size * 0.2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    if (isInteractive && !flower.unlocked) {
      ctx.fillStyle = '#4B5563';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', x + sway, y - flower.size - 15);
    }

    if (isInteractive && flower.discovered) {
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨', x + sway, y - flower.size - 10);
    }

    ctx.restore();
  };

  const drawFlowers = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const flower of decorativeFlowersRef.current) {
      const sway = Math.sin(timeRef.current * 2 + flower.swayPhase) * 1.5;
      const x = flower.x + ox;
      const y = flower.y + oy;
      if (x < -30 || x > viewportWidth + 30 || y < -30 || y > viewportHeight + 30) continue;

      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + flower.size);
      ctx.quadraticCurveTo(x + sway, y + flower.size * 0.5, x + sway, y);
      ctx.stroke();

      ctx.fillStyle = flower.color;
      for (let i = 0; i < flower.petalCount; i++) {
        const angle = (Math.PI * 2 * i) / flower.petalCount;
        const px = x + sway + Math.cos(angle) * flower.size * 0.4;
        const py = y + Math.sin(angle) * flower.size * 0.4;
        ctx.beginPath();
        ctx.ellipse(px, py, flower.size * 0.25, flower.size * 0.15, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(x + sway, y, flower.size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const flower of flowers) {
      if (flower.type === 'decorative') continue;
      drawFlower(ctx, flower, ox, oy, true);
    }
  };

  const drawFireflies = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const f of fireflies) {
      const x = f.x + ox;
      const y = f.y + oy;
      if (x < -30 || x > viewportWidth + 30 || y < -30 || y > viewportHeight + 30) continue;

      const glow = f.glow;
      ctx.save();
      
      ctx.globalAlpha = glow * 0.6;
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, 25);
      outerGlow.addColorStop(0, '#FFFACD');
      outerGlow.addColorStop(0.2, '#FFE066');
      outerGlow.addColorStop(0.5, 'rgba(255, 224, 102, 0.3)');
      outerGlow.addColorStop(1, 'rgba(255, 224, 102, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = glow * 0.9;
      const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, 12);
      innerGlow.addColorStop(0, '#FFFFFF');
      innerGlow.addColorStop(0.3, '#FFFACD');
      innerGlow.addColorStop(1, 'rgba(255, 250, 205, 0)');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = glow;
      ctx.fillStyle = '#FFFFF0';
      ctx.beginPath();
      ctx.arc(x, y, 2 + glow * 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, 1 + glow, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawFragments = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const fragment of fragments) {
      if (fragment.collected) continue;
      const x = fragment.x + ox;
      const y = fragment.y + oy + Math.sin(fragment.floatPhase) * 8;
      if (x < -80 || x > viewportWidth + 80 || y < -80 || y > viewportHeight + 80) continue;

      const glowIntensity = (Math.sin(fragment.glowPhase) + 1) / 2;
      const pulseScale = 1 + Math.sin(fragment.glowPhase * 2) * 0.1;
      
      ctx.save();
      
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, 60 + glowIntensity * 30);
      outerGlow.addColorStop(0, fragment.color + '66');
      outerGlow.addColorStop(0.2, fragment.color + '44');
      outerGlow.addColorStop(0.5, fragment.color + '22');
      outerGlow.addColorStop(1, fragment.color + '00');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, 60 + glowIntensity * 30, 0, Math.PI * 2);
      ctx.fill();
      
      const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, 35 + glowIntensity * 15);
      innerGlow.addColorStop(0, fragment.color + 'CC');
      innerGlow.addColorStop(0.4, fragment.color + '66');
      innerGlow.addColorStop(1, fragment.color + '00');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(x, y, 35 + glowIntensity * 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(x, y);
      ctx.rotate(fragment.glowPhase * 0.3);
      ctx.scale(pulseScale, pulseScale);
      
      ctx.shadowColor = fragment.color;
      ctx.shadowBlur = 15;
      
      ctx.fillStyle = fragment.color;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(16, 0);
      ctx.lineTo(0, 22);
      ctx.lineTo(-16, 0);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(8, -6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-8, -6);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(5, -4);
      ctx.lineTo(0, 2);
      ctx.lineTo(-5, -4);
      ctx.closePath();
      ctx.fill();
      
      if (fragment.emotion && EMOTIONS[fragment.emotion]) {
        const emotion = EMOTIONS[fragment.emotion];
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = emotion.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = emotion.glowColor;
        ctx.fillText(emotion.icon, 0, 0);
        ctx.shadowBlur = 0;
      }
      
      ctx.restore();
      
      ctx.save();
      const sparkCount = 3;
      for (let i = 0; i < sparkCount; i++) {
        const sparkAngle = fragment.glowPhase + (Math.PI * 2 * i) / sparkCount;
        const sparkDist = 25 + Math.sin(fragment.glowPhase * 3 + i) * 10;
        const sparkX = x + Math.cos(sparkAngle) * sparkDist;
        const sparkY = y + Math.sin(sparkAngle) * sparkDist;
        const sparkSize = 2 + Math.sin(fragment.glowPhase * 2 + i) * 1;
        
        ctx.globalAlpha = 0.6 + Math.sin(fragment.glowPhase * 4 + i) * 0.3;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  const drawPetals = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const petal of petals) {
      const x = petal.x + ox;
      const y = petal.y + oy;
      if (x < -50 || x > viewportWidth + 50 || y < -50 || y > viewportHeight + 50) continue;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(petal.rotation);
      
      ctx.shadowColor = petal.color;
      ctx.shadowBlur = 8;
      
      ctx.fillStyle = petal.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size, petal.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(-petal.size * 0.2, -petal.size * 0.1, petal.size * 0.4, petal.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(petal.size * 0.1, petal.size * 0.1, petal.size * 0.3, petal.size * 0.15, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawButterfly = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const x = butterfly.x + ox;
    const y = butterfly.y + oy;
    const speed = Math.sqrt(butterfly.vx * butterfly.vx + butterfly.vy * butterfly.vy);

    if (butterfly.isDashing) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      const dashGradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
      dashGradient.addColorStop(0, '#FFD700');
      dashGradient.addColorStop(0.3, '#FFA500');
      dashGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
      ctx.fillStyle = dashGradient;
      ctx.beginPath();
      ctx.arc(x, y, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      const dashAngle = butterfly.rotation;
      for (let i = 0; i < 5; i++) {
        const offset = (i - 2) * 8;
        const startX = x - Math.cos(dashAngle) * (30 + Math.abs(offset) * 2);
        const startY = y - Math.sin(dashAngle) * (30 + Math.abs(offset) * 2);
        const endX = x - Math.cos(dashAngle) * (60 + Math.abs(offset) * 3);
        const endY = y - Math.sin(dashAngle) * (60 + Math.abs(offset) * 3);
        ctx.globalAlpha = 0.6 - Math.abs(offset) * 0.1;
        ctx.beginPath();
        ctx.moveTo(startX + Math.sin(dashAngle) * offset, startY - Math.cos(dashAngle) * offset);
        ctx.lineTo(endX + Math.sin(dashAngle) * offset, endY - Math.cos(dashAngle) * offset);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (butterfly.isGliding) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      const glideGradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
      glideGradient.addColorStop(0, '#87CEEB');
      glideGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
      ctx.fillStyle = glideGradient;
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    const trailSize = butterfly.isDashing ? 60 : 40;
    const trailAlpha = butterfly.isDashing ? 0.4 : 0.2;
    ctx.globalAlpha = trailAlpha;
    const trailGradient = ctx.createRadialGradient(x, y, 0, x, y, trailSize);
    const trailColor = butterfly.isDashing ? '#FFD700' : '#9B7EDC';
    trailGradient.addColorStop(0, trailColor);
    trailGradient.addColorStop(1, 'rgba(155, 126, 220, 0)');
    ctx.fillStyle = trailGradient;
    ctx.beginPath();
    ctx.arc(x, y, trailSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(butterfly.rotation + Math.PI / 2);

    const wingFlap = Math.sin(butterfly.wingPhase) * 0.6;
    let flapAmplitude = 0.5 + Math.min(speed * 0.1, 0.5);
    
    if (butterfly.isGliding) {
      flapAmplitude *= 0.3;
    }
    if (butterfly.isDashing) {
      flapAmplitude *= 1.5;
    }

    const bodyColor = butterfly.isDashing ? '#6B4423' : '#4A3728';
    const wingColor = butterfly.isDashing ? '#FFD700' : '#9B7EDC';
    const wingHighlight = butterfly.isDashing ? '#FFF8DC' : '#B39DDB';
    const spotColor = butterfly.isDashing ? '#FF6B35' : '#FFD93D';
    const hindWingColor = butterfly.isGliding ? '#87CEEB' : '#FFB6C8';

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, butterfly.isDashing ? 5 : 4, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -18, butterfly.isDashing ? 6 : 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, -20);
    ctx.quadraticCurveTo(-8, -28, -5, -32);
    ctx.moveTo(3, -20);
    ctx.quadraticCurveTo(8, -28, 5, -32);
    ctx.stroke();

    if (butterfly.isDashing) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(-6, -18, 2, 0, Math.PI * 2);
      ctx.arc(6, -18, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const foreWingScale = butterfly.isGliding ? 1.3 : 1;

    ctx.save();
    ctx.rotate(-wingFlap * flapAmplitude);
    ctx.scale(foreWingScale, foreWingScale);
    ctx.fillStyle = wingColor;
    ctx.beginPath();
    ctx.ellipse(-18, -8, 20, 28, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = wingHighlight;
    ctx.beginPath();
    ctx.ellipse(-14, -12, 12, 16, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = spotColor;
    ctx.beginPath();
    ctx.arc(-18, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-22, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    if (butterfly.isGliding) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(-18, -8, 22, 30, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.rotate(wingFlap * flapAmplitude);
    ctx.scale(foreWingScale, foreWingScale);
    ctx.fillStyle = wingColor;
    ctx.beginPath();
    ctx.ellipse(18, -8, 20, 28, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = wingHighlight;
    ctx.beginPath();
    ctx.ellipse(14, -12, 12, 16, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = spotColor;
    ctx.beginPath();
    ctx.arc(18, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    if (butterfly.isGliding) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(18, -8, 22, 30, 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    const hindWingScale = butterfly.isGliding ? 1.2 : 1;

    ctx.save();
    ctx.rotate(-wingFlap * flapAmplitude * 0.7);
    ctx.scale(hindWingScale, hindWingScale);
    ctx.fillStyle = hindWingColor;
    ctx.beginPath();
    ctx.ellipse(-10, 12, 10, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(wingFlap * flapAmplitude * 0.7);
    ctx.scale(hindWingScale, hindWingScale);
    ctx.fillStyle = hindWingColor;
    ctx.beginPath();
    ctx.ellipse(10, 12, 10, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const p of particles) {
      const x = p.x + ox;
      const y = p.y + oy;
      const lifeRatio = p.life / p.maxLife;
      const size = p.size * lifeRatio;
      
      ctx.save();
      
      ctx.globalAlpha = lifeRatio * 0.6;
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      outerGlow.addColorStop(0, p.color + 'AA');
      outerGlow.addColorStop(0.3, p.color + '44');
      outerGlow.addColorStop(1, p.color + '00');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = lifeRatio;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = lifeRatio * 0.8;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawMapBorder = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const bx = mapBounds.minX + ox;
    const by = mapBounds.minY + oy;
    const bw = mapBounds.maxX - mapBounds.minX;
    const bh = mapBounds.maxY - mapBounds.minY;
    const time = timeRef.current;

    ctx.save();

    ctx.fillStyle = '#1a1a2e';
    if (bx > 0) ctx.fillRect(0, 0, bx, viewportHeight);
    if (bx + bw < viewportWidth) ctx.fillRect(bx + bw, 0, viewportWidth - bx - bw, viewportHeight);
    if (by > 0) ctx.fillRect(0, 0, viewportWidth, by);
    if (by + bh < viewportHeight) ctx.fillRect(0, by + bh, viewportWidth, viewportHeight - by - bh);

    ctx.fillStyle = 'rgba(100, 100, 150, 0.15)';
    for (let i = 0; i < 40; i++) {
      const seed = i * 0.7;
      const wave = Math.sin(time * 0.5 + seed) * 20;
      if (bx > 0) {
        ctx.beginPath();
        const py = (i * viewportHeight) / 40;
        ctx.ellipse(bx + wave, py, 15 + Math.sin(time + i) * 5, 40, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (bx + bw < viewportWidth) {
        ctx.beginPath();
        const py = (i * viewportHeight) / 40;
        ctx.ellipse(bx + bw - wave, py, 15 + Math.sin(time + i) * 5, 40, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < 40; i++) {
      const seed = i * 0.7;
      const wave = Math.cos(time * 0.5 + seed) * 20;
      if (by > 0) {
        ctx.beginPath();
        const px = (i * viewportWidth) / 40;
        ctx.ellipse(px, by + wave, 40, 15 + Math.sin(time + i) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (by + bh < viewportHeight) {
        ctx.beginPath();
        const px = (i * viewportWidth) / 40;
        ctx.ellipse(px, by + bh - wave, 40, 15 + Math.sin(time + i) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const borderColors = ['#9B7EDC', '#FFB6C8', '#A8E6CF', '#FFD93D'];
    const borderPulse = (Math.sin(time * 2) + 1) / 2;
    const borderWidth = 3 + borderPulse * 2;
    
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = borderColors[i % borderColors.length] + (i === 0 ? 'CC' : '66');
      ctx.lineWidth = borderWidth - i * 2;
      ctx.setLineDash([10 + Math.sin(time + i) * 3, 8]);
      ctx.lineDashOffset = time * 15 * (i === 0 ? 1 : -1);
      ctx.strokeRect(bx + i, by + i, bw - i * 2, bh - i * 2);
    }
    ctx.setLineDash([]);

    const corners = [
      { x: bx, y: by },
      { x: bx + bw, y: by },
      { x: bx, y: by + bh },
      { x: bx + bw, y: by + bh },
    ];
    for (const corner of corners) {
      const sparkleSize = 8 + borderPulse * 4;
      const sparkle = ctx.createRadialGradient(corner.x, corner.y, 0, corner.x, corner.y, sparkleSize * 2);
      sparkle.addColorStop(0, '#FFFFFF');
      sparkle.addColorStop(0.3, '#9B7EDC');
      sparkle.addColorStop(1, 'rgba(155, 126, 220, 0)');
      ctx.fillStyle = sparkle;
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, sparkleSize * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawCompanionButterfly = (
    ctx: CanvasRenderingContext2D,
    companion: ButterflyCompanion,
    ox: number,
    oy: number,
    isActive: boolean = false
  ) => {
    const x = companion.x + ox;
    const y = companion.y + oy;
    if (x < -80 || x > viewportWidth + 80 || y < -80 || y > viewportHeight + 80) return;

    const time = timeRef.current;
    const wingFlap = Math.sin(time * 6 + companion.x * 0.01) * 0.5;
    const bobOffset = Math.sin(time * 2 + companion.y * 0.01) * 3;

    ctx.save();
    ctx.translate(x, y + bobOffset);

    if (isActive) {
      const pulseScale = 1 + Math.sin(time * 3) * 0.05;
      ctx.scale(pulseScale, pulseScale);
      
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
      glowGradient.addColorStop(0, companion.color + '66');
      glowGradient.addColorStop(0.5, companion.color + '22');
      glowGradient.addColorStop(1, companion.color + '00');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#4A3728';
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -12, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4A3728';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -13);
    ctx.quadraticCurveTo(-6, -18, -4, -21);
    ctx.moveTo(2, -13);
    ctx.quadraticCurveTo(6, -18, 4, -21);
    ctx.stroke();

    ctx.save();
    ctx.rotate(-wingFlap);
    ctx.fillStyle = companion.wingColor;
    ctx.beginPath();
    ctx.ellipse(-12, -5, 14, 18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = companion.color;
    ctx.beginPath();
    ctx.ellipse(-10, -8, 8, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = companion.spotColor;
    ctx.beginPath();
    ctx.arc(-12, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(wingFlap);
    ctx.fillStyle = companion.wingColor;
    ctx.beginPath();
    ctx.ellipse(12, -5, 14, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = companion.color;
    ctx.beginPath();
    ctx.ellipse(10, -8, 8, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = companion.spotColor;
    ctx.beginPath();
    ctx.arc(12, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(-wingFlap * 0.6);
    ctx.fillStyle = companion.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(-7, 8, 7, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(wingFlap * 0.6);
    ctx.fillStyle = companion.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(7, 8, 7, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  const drawUnlockedCompanions = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const companion of companions) {
      if (!companion.unlocked) continue;
      const isActive = companion.id === activeCompanionId;
      drawCompanionButterfly(ctx, companion, ox, oy, isActive);
    }
  };

  const drawLockedCompanions = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const companion of companions) {
      if (companion.unlocked) continue;
      
      const x = companion.x + ox;
      const y = companion.y + oy;
      if (x < -80 || x > viewportWidth + 80 || y < -80 || y > viewportHeight + 80) continue;

      const time = timeRef.current;
      const bobOffset = Math.sin(time * 1.5 + companion.y * 0.01) * 5;

      ctx.save();
      ctx.translate(x, y + bobOffset);

      if (companion.encounterProgress >= 100) {
        const pulseAlpha = 0.3 + Math.sin(time * 4) * 0.2;
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
        glowGradient.addColorStop(0, companion.color + Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0'));
        glowGradient.addColorStop(0.5, companion.color + '22');
        glowGradient.addColorStop(1, companion.color + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = companion.color + '88';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = companion.color;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);

        ctx.fillStyle = companion.color + 'CC';
        ctx.font = '11px sans-serif';
        ctx.fillText('靠近遇见', 0, 30);
      } else {
        const progressAlpha = 0.15 + (companion.encounterProgress / 100) * 0.2;
        ctx.globalAlpha = progressAlpha;

        const questionMarkScale = 0.5 + (companion.encounterProgress / 100) * 0.5;
        ctx.save();
        ctx.scale(questionMarkScale, questionMarkScale);
        
        ctx.fillStyle = companion.color + '66';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
        ctx.restore();

        ctx.globalAlpha = 1;
        const barWidth = 40;
        const barHeight = 4;
        const progressWidth = (companion.encounterProgress / 100) * barWidth;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-barWidth / 2, 15, barWidth, barHeight);
        
        ctx.fillStyle = companion.color;
        ctx.fillRect(-barWidth / 2, 15, progressWidth, barHeight);
      }

      ctx.restore();
    }
  };

  const drawCompanionParticles = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const p of companionParticles) {
      const x = p.x + ox;
      const y = p.y + oy;
      const lifeRatio = p.life / p.maxLife;
      const size = p.size * lifeRatio;
      
      ctx.save();
      
      ctx.globalAlpha = lifeRatio * 0.6;
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      outerGlow.addColorStop(0, p.color + 'AA');
      outerGlow.addColorStop(0.3, p.color + '44');
      outerGlow.addColorStop(1, p.color + '00');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = lifeRatio;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = lifeRatio * 0.8;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawLightSources = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const light of lightSources) {
      const x = light.x + ox;
      const y = light.y + oy;
      if (x < -100 || x > viewportWidth + 100 || y < -100 || y > viewportHeight + 100) continue;

      const colors = LIGHT_COLOR_MAP[light.color];
      const isActive = activeLightId === light.id;
      const pulse = (Math.sin(light.pulsePhase) + 1) / 2;

      ctx.save();

      const glowSize = 30 + pulse * 15 + (isActive ? 20 : 0);
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      glowGradient.addColorStop(0, colors.glow + 'CC');
      glowGradient.addColorStop(0.4, colors.beam + '66');
      glowGradient.addColorStop(1, colors.beam + '00');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        ctx.strokeStyle = colors.beam + 'AA';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -timeRef.current * 20;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = colors.beam + '88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 50 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = colors.beam;
      ctx.beginPath();
      ctx.arc(x, y, 8 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 3 + pulse, 0, Math.PI * 2);
      ctx.fill();

      const dx = butterfly.x - light.x;
      const dy = butterfly.y - light.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && light.playerControlled) {
        ctx.fillStyle = colors.beam + 'CC';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isActive ? 'L 脱离' : 'L 操控光源', x, y - 50);
      }

      ctx.restore();
    }
  };

  const drawLightBeams = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const light of lightSources) {
      if (!light.active) continue;

      const x = light.x + ox;
      const y = light.y + oy;
      const endX = light.x + Math.cos(light.angle) * light.beamLength + ox;
      const endY = light.y + Math.sin(light.angle) * light.beamLength + oy;

      const colors = LIGHT_COLOR_MAP[light.color];
      const pulse = (Math.sin(light.pulsePhase * 2) + 1) / 2;

      ctx.save();

      const gradient = ctx.createLinearGradient(x, y, endX, endY);
      gradient.addColorStop(0, colors.beam + '88');
      gradient.addColorStop(0.3, colors.beam + '55');
      gradient.addColorStop(0.7, colors.beam + '33');
      gradient.addColorStop(1, colors.beam + '00');

      const halfWidth = light.beamWidth / 2 * (0.8 + pulse * 0.4);
      const perpX = -Math.sin(light.angle) * halfWidth;
      const perpY = Math.cos(light.angle) * halfWidth;

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x + perpX, y + perpY);
      ctx.lineTo(x - perpX, y - perpY);
      ctx.lineTo(endX - perpX * 0.3, endY - perpY * 0.3);
      ctx.lineTo(endX + perpX * 0.3, endY + perpY * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.3 + pulse * 0.2;
      const innerGradient = ctx.createLinearGradient(x, y, endX, endY);
      innerGradient.addColorStop(0, colors.glow + 'AA');
      innerGradient.addColorStop(0.5, colors.glow + '44');
      innerGradient.addColorStop(1, colors.glow + '00');

      const innerHalf = halfWidth * 0.4;
      const ipx = -Math.sin(light.angle) * innerHalf;
      const ipy = Math.cos(light.angle) * innerHalf;

      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.moveTo(x + ipx, y + ipy);
      ctx.lineTo(x - ipx, y - ipy);
      ctx.lineTo(endX - ipx * 0.2, endY - ipy * 0.2);
      ctx.lineTo(endX + ipx * 0.2, endY + ipy * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  };

  const drawGiantFlowers = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const flower of giantFlowers) {
      const x = flower.x + ox;
      const y = flower.y + oy;
      if (x < -150 || x > viewportWidth + 150 || y < -150 || y > viewportHeight + 150) continue;

      const sway = Math.sin(flower.swayPhase) * 3;
      const colors = LIGHT_COLOR_MAP[flower.reflectColor];
      const time = timeRef.current;

      ctx.save();

      if (flower.litIntensity > 0) {
        const glowRadius = flower.size * (1.5 + flower.litIntensity * 2);
        const glowGradient = ctx.createRadialGradient(x + sway, y, 0, x + sway, y, glowRadius);
        glowGradient.addColorStop(0, colors.beam + Math.floor(flower.litIntensity * 150).toString(16).padStart(2, '0'));
        glowGradient.addColorStop(0.5, colors.beam + Math.floor(flower.litIntensity * 60).toString(16).padStart(2, '0'));
        glowGradient.addColorStop(1, colors.beam + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x + sway, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#2D5016';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y + flower.size);
      ctx.quadraticCurveTo(x + sway, y + flower.size * 0.5, x + sway, y);
      ctx.stroke();

      const petalScale = 1 + flower.bloomPhase * 0.3;
      const baseColor = flower.litIntensity > 0 ? colors.beam : flower.color;
      ctx.fillStyle = baseColor;
      for (let i = 0; i < flower.petalCount; i++) {
        const angle = (Math.PI * 2 * i) / flower.petalCount + flower.swayPhase * 0.1;
        const px = x + sway + Math.cos(angle) * flower.size * 0.5 * petalScale;
        const py = y + Math.sin(angle) * flower.size * 0.5 * petalScale;
        ctx.beginPath();
        ctx.ellipse(px, py, flower.size * 0.4 * petalScale, flower.size * 0.2 * petalScale, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = flower.litIntensity > 0 ? colors.glow : '#FFD93D';
      ctx.beginPath();
      ctx.arc(x + sway, y, flower.size * 0.25 * petalScale, 0, Math.PI * 2);
      ctx.fill();

      if (flower.litIntensity > 0.5) {
        ctx.fillStyle = colors.particle + '88';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(flower.name, x + sway, y - flower.size - 15);

        for (let i = 0; i < 5; i++) {
          const sparkAngle = time * 2 + (Math.PI * 2 * i) / 5;
          const sparkDist = flower.size * 0.8 + Math.sin(time * 3 + i) * 10;
          const sparkX = x + sway + Math.cos(sparkAngle) * sparkDist;
          const sparkY = y + Math.sin(sparkAngle) * sparkDist;
          ctx.fillStyle = colors.glow;
          ctx.globalAlpha = 0.5 + Math.sin(time * 4 + i) * 0.3;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }
  };

  const drawHiddenPaths = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const path of hiddenPaths) {
      if (path.revealProgress <= 0) continue;

      const colors = LIGHT_COLOR_MAP[path.requiredColor];
      ctx.save();
      ctx.globalAlpha = path.revealProgress * 0.8;

      if (path.points.length < 2) { ctx.restore(); continue; }

      ctx.strokeStyle = path.revealed ? colors.beam : colors.beam + '88';
      ctx.lineWidth = path.width * path.revealProgress;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(path.revealed ? [] : [8, 8]);
      ctx.lineDashOffset = path.revealed ? 0 : -timeRef.current * 15;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x + ox, path.points[0].y + oy);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x + ox, path.points[i].y + oy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (path.revealed) {
        const glowWidth = path.width * 2;
        ctx.strokeStyle = colors.glow + '44';
        ctx.lineWidth = glowWidth;
        ctx.beginPath();
        ctx.moveTo(path.points[0].x + ox, path.points[0].y + oy);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x + ox, path.points[i].y + oy);
        }
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  const drawMemoryTexts = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const text of memoryTexts) {
      if (text.revealProgress <= 0) continue;

      const colors = LIGHT_COLOR_MAP[text.requiredColor];
      const x = text.x + ox;
      const y = text.y + oy;

      ctx.save();
      ctx.globalAlpha = text.revealProgress;

      if (text.revealProgress < 1) {
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 50 * text.revealProgress);
        glowGradient.addColorStop(0, colors.glow + Math.floor(text.revealProgress * 100).toString(16).padStart(2, '0'));
        glowGradient.addColorStop(1, colors.beam + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, 50 * text.revealProgress, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = text.revealed ? '#FFFFFF' : colors.glow;
      ctx.font = `bold ${text.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = colors.beam;
      ctx.shadowBlur = text.revealed ? 10 : 5;
      ctx.fillText(text.text, x, y);
      ctx.shadowBlur = 0;

      if (text.revealed) {
        const shimmer = Math.sin(timeRef.current * 3) * 0.2 + 0.8;
        ctx.globalAlpha = shimmer * 0.3;
        ctx.fillStyle = colors.particle;
        ctx.fillText(text.text, x, y);
      }

      ctx.restore();
    }
  };

  const drawLightMechanisms = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const mech of lightMechanisms) {
      const x = mech.x + ox;
      const y = mech.y + oy;
      if (x < -80 || x > viewportWidth + 80 || y < -80 || y > viewportHeight + 80) continue;

      const colors = LIGHT_COLOR_MAP[mech.requiredColor];
      const pulse = (Math.sin(mech.pulsePhase) + 1) / 2;

      ctx.save();

      if (!mech.activated) {
        ctx.fillStyle = colors.beam + Math.floor(15 + pulse * 15).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(x, y, mech.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors.beam + '66';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -timeRef.current * 10;
        ctx.beginPath();
        ctx.arc(x, y, mech.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const progressAngle = mech.activateProgress * Math.PI * 2;
        ctx.strokeStyle = colors.beam;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, mech.size + 5, -Math.PI / 2, -Math.PI / 2 + progressAngle);
        ctx.stroke();
      } else {
        const glowRadius = mech.size * (1.5 + pulse * 0.5);
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        glowGradient.addColorStop(0, colors.beam + 'AA');
        glowGradient.addColorStop(0.5, colors.glow + '44');
        glowGradient.addColorStop(1, colors.beam + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.beam;
        ctx.beginPath();
        ctx.arc(x, y, mech.size * mech.activateProgress, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, mech.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = colors.beam + 'CC';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      const labelMap: Record<string, string> = { gate: '门', bridge: '桥', portal: '传送', bloom: '绽放' };
      ctx.fillText(labelMap[mech.type] || mech.type, x, y + mech.size + 15);

      ctx.restore();
    }
  };

  const drawEchoPuzzles = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const now = Date.now() / 1000;
    for (const puzzle of echoPuzzles) {
      const px = puzzle.x + ox;
      const py = puzzle.y + oy;
      if (px < -200 || px > viewportWidth + 200 || py < -200 || py > viewportHeight + 200) continue;

      const pulse = (Math.sin(puzzle.pulsePhase) + 1) / 2;
      const time = timeRef.current;

      const timeDiff = Math.abs(puzzle.phantomLastInZoneTime - puzzle.butterflyLastInZoneTime);
      const inTimeWindow = timeDiff <= puzzle.timeWindowSeconds &&
                          puzzle.phantomLastInZoneTime > 0 &&
                          puzzle.butterflyLastInZoneTime > 0 &&
                          !puzzle.activated;
      const windowPulse = inTimeWindow ? (Math.sin(time * 8) + 1) / 2 : 0;

      ctx.save();

      if (puzzle.activated) {
        const glowRadius = puzzle.size * (2 + pulse * 0.5);
        const glowGradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        glowGradient.addColorStop(0, '#CE93D8AA');
        glowGradient.addColorStop(0.5, '#9B7EDC44');
        glowGradient.addColorStop(1, '#9B7EDC00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#9B7EDC';
        ctx.beginPath();
        ctx.arc(px, py, puzzle.size * puzzle.activateProgress, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, puzzle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(155, 126, 220, ${0.08 + pulse * 0.06})`;
        ctx.beginPath();
        ctx.arc(px, py, puzzle.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(155, 126, 220, ${0.3 + pulse * 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -time * 10;
        ctx.beginPath();
        ctx.arc(px, py, puzzle.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (puzzle.activateProgress > 0) {
          const progressAngle = puzzle.activateProgress * Math.PI * 2;
          ctx.strokeStyle = inTimeWindow ? '#FFD700' : '#CE93D8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(px, py, puzzle.size + 6, -Math.PI / 2, -Math.PI / 2 + progressAngle);
          ctx.stroke();
        }

        const phantomZoneX = puzzle.phantomZoneX + ox;
        const phantomZoneY = puzzle.phantomZoneY + oy;
        const butterflyZoneX = puzzle.butterflyZoneX + ox;
        const butterflyZoneY = puzzle.butterflyZoneY + oy;

        const phantomRecentlyInZone = now - puzzle.phantomLastInZoneTime <= puzzle.timeWindowSeconds && puzzle.phantomLastInZoneTime > 0;
        const butterflyRecentlyInZone = now - puzzle.butterflyLastInZoneTime <= puzzle.timeWindowSeconds && puzzle.butterflyLastInZoneTime > 0;

        const phantomAlpha = phantomRecentlyInZone ? (0.25 + pulse * 0.15) : (0.1 + pulse * 0.08);
        const phantomColor = phantomRecentlyInZone ? '95, 153, 255' : '155, 126, 220';
        ctx.fillStyle = `rgba(${phantomColor}, ${phantomAlpha})`;
        ctx.beginPath();
        ctx.arc(phantomZoneX, phantomZoneY, puzzle.phantomZoneRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${phantomColor}, ${phantomAlpha * 2})`;
        ctx.lineWidth = phantomRecentlyInZone ? 2.5 : 1.5;
        ctx.setLineDash(phantomRecentlyInZone ? [] : [4, 4]);
        ctx.lineDashOffset = -time * 8;
        ctx.beginPath();
        ctx.arc(phantomZoneX, phantomZoneY, puzzle.phantomZoneRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = phantomRecentlyInZone ? 'rgba(95, 153, 255, 0.8)' : 'rgba(206, 147, 216, 0.5)';
        ctx.font = phantomRecentlyInZone ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('幻影区', phantomZoneX, phantomZoneY + 3);

        const butterflyAlpha = butterflyRecentlyInZone ? (0.25 + pulse * 0.15) : (0.1 + pulse * 0.08);
        const butterflyColor = butterflyRecentlyInZone ? '95, 153, 255' : '206, 147, 216';
        ctx.fillStyle = `rgba(${butterflyColor}, ${butterflyAlpha})`;
        ctx.beginPath();
        ctx.arc(butterflyZoneX, butterflyZoneY, puzzle.butterflyZoneRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${butterflyColor}, ${butterflyAlpha * 2})`;
        ctx.lineWidth = butterflyRecentlyInZone ? 2.5 : 1.5;
        ctx.setLineDash(butterflyRecentlyInZone ? [] : [4, 4]);
        ctx.lineDashOffset = time * 8;
        ctx.beginPath();
        ctx.arc(butterflyZoneX, butterflyZoneY, puzzle.butterflyZoneRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = butterflyRecentlyInZone ? 'rgba(95, 153, 255, 0.8)' : 'rgba(206, 147, 216, 0.5)';
        ctx.font = butterflyRecentlyInZone ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.fillText('蝴蝶区', butterflyZoneX, butterflyZoneY + 3);

        if (inTimeWindow) {
          const connectionAlpha = 0.3 + windowPulse * 0.5;
          ctx.strokeStyle = `rgba(255, 215, 0, ${connectionAlpha})`;
          ctx.lineWidth = 2 + windowPulse * 2;
          ctx.beginPath();
          ctx.moveTo(phantomZoneX, phantomZoneY);
          ctx.lineTo(px, py);
          ctx.lineTo(butterflyZoneX, butterflyZoneY);
          ctx.stroke();

          for (let i = 0; i < 3; i++) {
            const t = ((time * 0.5 + i * 0.33) % 1);
            const midX = phantomZoneX + (butterflyZoneX - phantomZoneX) * t;
            const midY = phantomZoneY + (butterflyZoneY - phantomZoneY) * t;
            const passX = midX + (px - midX) * 0.5;
            const passY = midY + (py - midY) * 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${connectionAlpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(passX, passY, 3 + windowPulse * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.strokeStyle = 'rgba(155, 126, 220, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(phantomZoneX, phantomZoneY);
          ctx.lineTo(px, py);
          ctx.lineTo(butterflyZoneX, butterflyZoneY);
          ctx.stroke();
        }

        if (inTimeWindow) {
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✦ 时间窗口激活 ✦', px, py - puzzle.size - 15);
        }
      }

      const typeLabelMap: Record<string, string> = { memory: '记忆', resonance: '共振', mirror: '镜像' };
      ctx.fillStyle = '#9B7EDCCC';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(typeLabelMap[puzzle.type] || puzzle.type, px, py + puzzle.size + 15);

      ctx.restore();
    }
  };

  const drawPhantomTrails = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const trail of phantomTrails) {
      if (!trail.isPlaying || trail.snapshots.length === 0) continue;

      const snapshotIndex = Math.floor(trail.activeSnapshotIndex);
      const snapshot = trail.snapshots[Math.min(snapshotIndex, trail.snapshots.length - 1)];
      if (!snapshot) continue;

      const x = snapshot.x + ox;
      const y = snapshot.y + oy;
      if (x < -100 || x > viewportWidth + 100 || y < -100 || y > viewportHeight + 100) continue;

      const time = timeRef.current;
      const fadeAlpha = Math.min(trail.fadePhase, 0.6);

      ctx.save();
      ctx.globalAlpha = fadeAlpha;

      const trailGlow = ctx.createRadialGradient(x, y, 0, x, y, 50);
      trailGlow.addColorStop(0, 'rgba(155, 126, 220, 0.3)');
      trailGlow.addColorStop(0.5, 'rgba(155, 126, 220, 0.1)');
      trailGlow.addColorStop(1, 'rgba(155, 126, 220, 0)');
      ctx.fillStyle = trailGlow;
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();

      const historyCount = Math.min(20, snapshotIndex);
      if (historyCount > 1) {
        ctx.beginPath();
        const startIdx = Math.max(0, snapshotIndex - historyCount);
        ctx.moveTo(trail.snapshots[startIdx].x + ox, trail.snapshots[startIdx].y + oy);
        for (let i = startIdx + 1; i <= snapshotIndex; i++) {
          ctx.lineTo(trail.snapshots[i].x + ox, trail.snapshots[i].y + oy);
        }
        ctx.strokeStyle = 'rgba(155, 126, 220, 0.25)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        for (let i = startIdx; i <= snapshotIndex; i += 3) {
          const alpha = 0.1 + (i - startIdx) / historyCount * 0.2;
          ctx.fillStyle = `rgba(155, 126, 220, ${alpha})`;
          ctx.beginPath();
          ctx.arc(trail.snapshots[i].x + ox, trail.snapshots[i].y + oy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(snapshot.rotation + Math.PI / 2);

      const wingFlap = Math.sin(snapshot.wingPhase) * 0.5;
      const bodyColor = snapshot.isDashing ? '#7B5EA7' : '#6A4C93';
      const wingColor = snapshot.isDashing ? '#B39DDB' : '#9B7EDC';
      const wingHighlight = '#D1C4E9';
      const spotColor = '#E1BEE7';

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -14, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-2, -15);
      ctx.quadraticCurveTo(-5, -22, -3, -25);
      ctx.moveTo(2, -15);
      ctx.quadraticCurveTo(5, -22, 3, -25);
      ctx.stroke();

      ctx.save();
      ctx.rotate(-wingFlap);
      ctx.fillStyle = wingColor;
      ctx.beginPath();
      ctx.ellipse(-14, -6, 16, 22, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = wingHighlight;
      ctx.beginPath();
      ctx.ellipse(-11, -9, 9, 13, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = spotColor;
      ctx.beginPath();
      ctx.arc(-14, -11, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.rotate(wingFlap);
      ctx.fillStyle = wingColor;
      ctx.beginPath();
      ctx.ellipse(14, -6, 16, 22, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = wingHighlight;
      ctx.beginPath();
      ctx.ellipse(11, -9, 9, 13, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = spotColor;
      ctx.beginPath();
      ctx.arc(14, -11, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = wingColor;
      ctx.globalAlpha = fadeAlpha * 0.7;
      ctx.save();
      ctx.rotate(-wingFlap * 0.6);
      ctx.beginPath();
      ctx.ellipse(-8, 9, 6, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.rotate(wingFlap * 0.6);
      ctx.beginPath();
      ctx.ellipse(8, 9, 6, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();

      ctx.globalAlpha = fadeAlpha * 0.8;
      ctx.fillStyle = '#D1C4E9';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('过去的幻影', x, y - 35);

      if (snapshot.action === 'dash') {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
      } else if (snapshot.action === 'glide') {
        ctx.strokeStyle = 'rgba(135, 206, 235, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  const drawEchoParticles = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const p of echoParticles) {
      const x = p.x + ox;
      const y = p.y + oy;
      const lifeRatio = p.life / p.maxLife;
      const size = p.size * lifeRatio;

      ctx.save();

      ctx.globalAlpha = lifeRatio * 0.6;
      const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      outerGlow.addColorStop(0, p.color + 'AA');
      outerGlow.addColorStop(0.3, p.color + '44');
      outerGlow.addColorStop(1, p.color + '00');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = lifeRatio;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = lifeRatio * 0.8;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  };

  const drawFog = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (let row = 0; row < fogGrid.length; row++) {
      for (let col = 0; col < fogGrid[row].length; col++) {
        const cell = fogGrid[row][col];
        const x = cell.x + ox;
        const y = cell.y + oy;

        if (x < -fogCellSize || x > viewportWidth + fogCellSize ||
            y < -fogCellSize || y > viewportHeight + fogCellSize) {
          continue;
        }

        let fogAlpha = 0;
        if (cell.explored) {
          fogAlpha = 0.15 + (1 - cell.visibility) * 0.4;
        } else {
          fogAlpha = 0.85;
        }

        if (fogAlpha > 0.01) {
          ctx.fillStyle = `rgba(30, 20, 50, ${fogAlpha})`;
          ctx.fillRect(x, y, fogCellSize + 1, fogCellSize + 1);

          if (cell.explored && cell.visibility > 0.3) {
            const gradient = ctx.createRadialGradient(
              x + fogCellSize / 2, y + fogCellSize / 2, 0,
              x + fogCellSize / 2, y + fogCellSize / 2, fogCellSize
            );
            gradient.addColorStop(0, `rgba(155, 126, 220, ${cell.visibility * 0.15})`);
            gradient.addColorStop(1, 'rgba(155, 126, 220, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - fogCellSize, y - fogCellSize, fogCellSize * 3, fogCellSize * 3);
          }
        }
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};
