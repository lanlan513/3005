import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { Flower, Tree, ButterflyCompanion, DreamRegion } from '../types/game';
import { BASE_ACCEL, FRAGMENT_RESPAWN_INTERVAL } from '../store/gameStore';

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
  }, [dash, setGliding, openCompanionPanel]);

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
    drawHiddenAreas(ctx, offsetX, offsetY);
    drawTrees(ctx, offsetX, offsetY);
    drawFlowers(ctx, offsetX, offsetY);
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
    gradient.addColorStop(0, '#A8E6CF');
    gradient.addColorStop(0.5, '#88D8A8');
    gradient.addColorStop(1, '#6BC88A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    ctx.fillStyle = 'rgba(77, 167, 108, 0.3)';
    for (let i = 0; i < 60; i++) {
      const gx = ((i * 137) % mapWidth) + ox;
      const gy = ((i * 89) % mapHeight) + oy;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 30 + (i % 3) * 10, 20 + (i % 2) * 8, i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawDreamRegions = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    for (const region of dreamRegions) {
      const x = region.x + ox;
      const y = region.y + oy;
      
      if (x + region.width < -100 || x > viewportWidth + 100 || 
          y + region.height < -100 || y > viewportHeight + 100) continue;

      ctx.save();

      if (region.unlocked) {
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
      } else {
        const hintAlpha = 0.08 + Math.sin(timeRef.current * 1.2 + region.order) * 0.04;
        ctx.fillStyle = region.themeColor + Math.floor(hintAlpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(x, y, region.width, region.height);
        
        ctx.strokeStyle = region.themeColor + '22';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(x, y, region.width, region.height);
        ctx.setLineDash([]);

        ctx.fillStyle = region.themeColor + '66';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', x + region.width / 2, y + region.height / 2);
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
    ctx.save();
    ctx.strokeStyle = 'rgba(155, 126, 220, 0.4)';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 15]);
    ctx.strokeRect(ox, oy, mapWidth, mapHeight);
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
