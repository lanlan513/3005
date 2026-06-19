import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { Flower, Tree } from '../types/game';

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
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
      const accel = 0.8;
      setButterflyVelocity(butterfly.vx + dx * accel, butterfly.vy + dy * accel);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      spawnRandomFragments();
    }, 15000);
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
    drawPath(ctx, offsetX, offsetY);
    drawTrees(ctx, offsetX, offsetY);
    drawFlowers(ctx, offsetX, offsetY);
    drawFireflies(ctx, offsetX, offsetY);
    drawFragments(ctx, offsetX, offsetY);
    drawPetals(ctx, offsetX, offsetY);
    drawButterfly(ctx, offsetX, offsetY);
    drawParticles(ctx, offsetX, offsetY);
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
      const gradient = ctx.createRadialGradient(x + sway, y, 0, x + sway, y, flower.size * 2.5);
      gradient.addColorStop(0, flower.color + '66');
      gradient.addColorStop(0.5, flower.color + '22');
      gradient.addColorStop(1, flower.color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x + sway, y, flower.size * 2.5, 0, Math.PI * 2);
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
      if (x < -20 || x > viewportWidth + 20 || y < -20 || y > viewportHeight + 20) continue;

      const glow = f.glow;
      ctx.save();
      ctx.globalAlpha = glow * 0.8;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, '#FFFACD');
      gradient.addColorStop(0.4, '#FFE066');
      gradient.addColorStop(1, 'rgba(255, 224, 102, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF8DC';
      ctx.beginPath();
      ctx.arc(x, y, 2 + glow * 2, 0, Math.PI * 2);
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
      ctx.save();
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50 + glowIntensity * 20);
      gradient.addColorStop(0, fragment.color + 'CC');
      gradient.addColorStop(0.3, fragment.color + '66');
      gradient.addColorStop(1, fragment.color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 50 + glowIntensity * 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(x, y);
      ctx.rotate(fragment.glowPhase * 0.3);
      ctx.fillStyle = fragment.color;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(16, 0);
      ctx.lineTo(0, 22);
      ctx.lineTo(-16, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(8, -6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-8, -6);
      ctx.closePath();
      ctx.fill();
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
      ctx.fillStyle = petal.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size, petal.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(-petal.size * 0.2, -petal.size * 0.1, petal.size * 0.4, petal.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawButterfly = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const x = butterfly.x + ox;
    const y = butterfly.y + oy;

    ctx.save();
    ctx.globalAlpha = 0.2;
    const trailGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
    trailGradient.addColorStop(0, '#9B7EDC');
    trailGradient.addColorStop(1, 'rgba(155, 126, 220, 0)');
    ctx.fillStyle = trailGradient;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(butterfly.rotation + Math.PI / 2);

    const wingFlap = Math.sin(butterfly.wingPhase) * 0.6;
    const speed = Math.sqrt(butterfly.vx * butterfly.vx + butterfly.vy * butterfly.vy);
    const flapAmplitude = 0.5 + Math.min(speed * 0.1, 0.5);

    ctx.fillStyle = '#4A3728';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -18, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4A3728';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, -20);
    ctx.quadraticCurveTo(-8, -28, -5, -32);
    ctx.moveTo(3, -20);
    ctx.quadraticCurveTo(8, -28, 5, -32);
    ctx.stroke();

    ctx.save();
    ctx.rotate(-wingFlap * flapAmplitude);
    ctx.fillStyle = '#9B7EDC';
    ctx.beginPath();
    ctx.ellipse(-18, -8, 20, 28, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B39DDB';
    ctx.beginPath();
    ctx.ellipse(-14, -12, 12, 16, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(-18, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-22, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(wingFlap * flapAmplitude);
    ctx.fillStyle = '#9B7EDC';
    ctx.beginPath();
    ctx.ellipse(18, -8, 20, 28, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B39DDB';
    ctx.beginPath();
    ctx.ellipse(14, -12, 12, 16, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(18, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(-wingFlap * flapAmplitude * 0.7);
    ctx.fillStyle = '#FFB6C8';
    ctx.beginPath();
    ctx.ellipse(-10, 12, 10, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(wingFlap * flapAmplitude * 0.7);
    ctx.fillStyle = '#FFB6C8';
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
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = (p.life / p.maxLife) * 0.5;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
      glow.addColorStop(0, p.color);
      glow.addColorStop(1, p.color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
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
