import { create } from 'zustand';
import { GameState, Butterfly, Fragment, Particle, Petal, Firefly, FogCell, Flower, ButterflyAbility, ButterflyCompanion, DynamicParticle } from '../types/game';
import { INITIAL_FRAGMENTS, MAP_WIDTH, MAP_HEIGHT } from '../data/fragments';
import { getStoryByFragmentId } from '../data/stories';
import { FLOWER_DATA, checkFlowerUnlock } from '../data/flowers';
import { 
  INITIAL_ABILITIES, 
  INITIAL_HIDDEN_AREAS, 
  getAbilityLevelStats, 
  checkAbilityUnlock,
  getSpeedLevelByFragments,
  getVisibilityLevelByExploration,
  getDashLevelByFragments,
  getGlideLevelByExploration
} from '../data/abilities';
import {
  INITIAL_COMPANIONS,
  getCompanionVisibilityBonus,
  getCompanionDiscoveryBonus,
  getCompanionEncounterProgress,
  generateHint,
} from '../data/companions';
import {
  DREAM_REGIONS,
  generateRegionDecorations,
  getRegionByFragmentId,
  getInitialMapBounds,
  calculateMapBounds,
  START_REGION,
} from '../data/dreamRegions';

const FOG_CELL_SIZE = 40;
const BASE_VISIBILITY_RADIUS = 120;
const BASE_MAX_SPEED = 4;
export const BASE_ACCEL = 0.8;
export const FRAGMENT_RESPAWN_INTERVAL = 15000;
const DASH_COOLDOWN = 60;
const MAX_GLIDE_ENERGY = 100;
const GLIDE_ENERGY_REGEN = 0.5;
const GLIDE_ENERGY_DRAIN = 0.8;

const createInitialButterfly = (): Butterfly => ({
  x: START_REGION.x + START_REGION.width / 2,
  y: START_REGION.y + START_REGION.height / 2,
  vx: 0,
  vy: 0,
  rotation: -Math.PI / 4,
  wingPhase: 0,
  isDashing: false,
  dashCooldown: 0,
  isGliding: false,
  glideEnergy: MAX_GLIDE_ENERGY,
});

const createInitialPetals = (): Petal[] => {
  const petals: Petal[] = [];
  const colors = ['#FFB6C8', '#FFC0CB', '#FFE4E9', '#FFD1DC', '#F8C8DC'];
  for (let i = 0; i < 30; i++) {
    petals.push({
      x: Math.random() * MAP_WIDTH,
      y: Math.random() * MAP_HEIGHT,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return petals;
};

const createInitialFireflies = (): Firefly[] => {
  const fireflies: Firefly[] = [];
  for (let i = 0; i < 40; i++) {
    fireflies.push({
      x: Math.random() * MAP_WIDTH,
      y: Math.random() * MAP_HEIGHT,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
      glow: Math.random(),
    });
  }
  return fireflies;
};

const createInitialFlowers = (): Flower[] => {
  return FLOWER_DATA.map((flowerData) => ({
    ...flowerData,
    swayPhase: Math.random() * Math.PI * 2,
    bloomPhase: 0,
    pulsePhase: Math.random() * Math.PI * 2,
  }));
};

const createFogGrid = (): { grid: FogCell[][]; total: number } => {
  const cols = Math.ceil(MAP_WIDTH / FOG_CELL_SIZE);
  const rows = Math.ceil(MAP_HEIGHT / FOG_CELL_SIZE);
  const grid: FogCell[][] = [];

  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      grid[row][col] = {
        x: col * FOG_CELL_SIZE,
        y: row * FOG_CELL_SIZE,
        explored: false,
        visibility: 0,
      };
    }
  }
  return { grid, total: cols * rows };
};

const generateRandomFragments = (count: number, existingIds: string[]): Fragment[] => {
  const fragments: Fragment[] = [];
  const colors = ['#FFB6C8', '#9B7EDC', '#A8E6CF', '#FFD93D', '#87CEEB', '#FF9ECD'];
  const regions = [
    { minX: 100, maxX: 800, minY: 100, maxY: 600 },
    { minX: 800, maxX: 1600, minY: 100, maxY: 600 },
    { minX: 1600, maxX: 2300, minY: 100, maxY: 600 },
    { minX: 100, maxX: 800, minY: 600, maxY: 1200 },
    { minX: 800, maxX: 1600, minY: 600, maxY: 1200 },
    { minX: 1600, maxX: 2300, minY: 600, maxY: 1200 },
    { minX: 100, maxX: 800, minY: 1200, maxY: 1700 },
    { minX: 800, maxX: 1600, minY: 1200, maxY: 1700 },
    { minX: 1600, maxX: 2300, minY: 1200, maxY: 1700 },
  ];

  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const id = `fragment-random-${Date.now()}-${i}`;
    if (existingIds.includes(id)) continue;

    fragments.push({
      id,
      x: region.minX + Math.random() * (region.maxX - region.minX),
      y: region.minY + Math.random() * (region.maxY - region.minY),
      collected: false,
      storyId: '',
      glowPhase: Math.random() * Math.PI * 2,
      floatPhase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return fragments;
};

const initialFog = createFogGrid();

export const useGameStore = create<GameState & {
  setButterflyVelocity: (vx: number, vy: number) => void;
  updateButterfly: () => void;
  checkFragmentCollision: () => void;
  updateParticles: () => void;
  updatePetals: () => void;
  updateFireflies: () => void;
  updateFragments: () => void;
  updateFlowers: () => void;
  spawnCollectParticles: (x: number, y: number, color: string) => void;
  updateCamera: () => void;
  setViewport: (w: number, h: number) => void;
  startGame: () => void;
  closeStory: () => void;
  openStoryBook: () => void;
  closeStoryBook: () => void;
  openFlowerCard: (flowerId: string) => void;
  closeFlowerCard: () => void;
  discoverFlower: (flowerId: string) => void;
  checkFlowerUnlocks: () => void;
  resetGame: () => void;
  updateFog: () => void;
  spawnRandomFragments: () => void;
  updateExplorationProgress: () => void;
  dash: () => void;
  setGliding: (isGliding: boolean) => void;
  updateAbilityLevels: () => void;
  checkAbilityUnlocks: () => void;
  checkHiddenAreaDiscovery: () => void;
  closeAbilityUnlock: () => void;
  spawnDashParticles: () => void;
  getActiveCompanion: () => ButterflyCompanion | null;
  checkCompanionEncounters: () => void;
  updateCompanionEncounterProgress: () => void;
  updateCompanions: () => void;
  unlockCompanion: (companionId: string) => void;
  setActiveCompanion: (companionId: string | null) => void;
  openCompanionPanel: () => void;
  closeCompanionPanel: () => void;
  closeCompanionEncounter: () => void;
  acceptCompanion: () => void;
  updateCompanionParticles: () => void;
  spawnCompanionParticles: (x: number, y: number, color: string) => void;
  checkCompanionProximity: () => void;
  triggerHint: () => void;
  dismissHint: () => void;
  unlockDreamRegion: (fragmentId: string) => void;
  updateDynamicParticles: () => void;
  spawnDynamicParticles: () => void;
  closeRegionUnlock: () => void;
  updateDreamDecorations: () => void;
  clampButterflyToBounds: () => void;
  updateRegionAnimation: () => void;
  isInUnlockedRegion: (x: number, y: number) => boolean;
}>((set, get) => ({
  butterfly: createInitialButterfly(),
  fragments: [...INITIAL_FRAGMENTS],
  collectedFragments: [],
  unlockedStories: [],
  isPlaying: false,
  showStory: false,
  currentStory: null,
  showStoryBook: false,
  particles: [],
  petals: createInitialPetals(),
  fireflies: createInitialFireflies(),
  flowers: createInitialFlowers(),
  discoveredFlowers: [],
  showFlowerCard: false,
  currentFlower: null,
  mapWidth: MAP_WIDTH,
  mapHeight: MAP_HEIGHT,
  cameraX: START_REGION.x + START_REGION.width / 2,
  cameraY: START_REGION.y + START_REGION.height / 2,
  viewportWidth: 800,
  viewportHeight: 600,
  fogGrid: initialFog.grid,
  fogCellSize: FOG_CELL_SIZE,
  exploredCells: 0,
  totalCells: initialFog.total,
  explorationProgress: 0,
  abilities: [...INITIAL_ABILITIES],
  abilityLevel: getAbilityLevelStats(1, 1, 0, 0),
  hiddenAreas: [...INITIAL_HIDDEN_AREAS],
  showAbilityUnlock: false,
  unlockAbility: null,
  baseSpeed: BASE_MAX_SPEED,
  baseVisibility: BASE_VISIBILITY_RADIUS,
  companions: [...INITIAL_COMPANIONS],
  activeCompanionId: null,
  showCompanionPanel: false,
  showCompanionEncounter: false,
  encounterCompanion: null,
  companionParticles: [],
  currentHint: null,
  showHint: false,
  lastHintTime: 0,
  dreamRegions: [...DREAM_REGIONS],
  dreamDecorations: generateRegionDecorations(START_REGION),
  dynamicParticles: [],
  showRegionUnlock: false,
  unlockRegion: null,
  mapBounds: getInitialMapBounds(),

  setViewport: (w, h) => set({ viewportWidth: w, viewportHeight: h }),

  setButterflyVelocity: (vx, vy) => {
    const { butterfly, abilityLevel, baseSpeed } = get();
    const speed = Math.sqrt(vx * vx + vy * vy);
    const maxSpeed = baseSpeed * abilityLevel.speedMultiplier;
    if (speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed;
      vy = (vy / speed) * maxSpeed;
    }
    const wingSpeed = speed > 0.1 ? 0.4 : 0.15;
    set({
      butterfly: {
        ...butterfly,
        vx,
        vy,
        rotation: speed > 0.1 ? Math.atan2(vy, vx) : butterfly.rotation,
        wingPhase: butterfly.wingPhase + wingSpeed * (butterfly.isGliding ? 0.5 : 1),
      },
    });
  },

  updateButterfly: () => {
    const { butterfly, mapBounds, abilityLevel } = get();
    const friction = butterfly.isGliding ? 0.98 - abilityLevel.glideEfficiency * 0.03 : 0.92;
    let newX = butterfly.x + butterfly.vx;
    let newY = butterfly.y + butterfly.vy;
    let newVx = butterfly.vx * friction;
    let newVy = butterfly.vy * friction;

    const margin = 50;
    const clampedX = Math.max(mapBounds.minX + margin, Math.min(mapBounds.maxX - margin, newX));
    const clampedY = Math.max(mapBounds.minY + margin, Math.min(mapBounds.maxY - margin, newY));
    if (clampedX !== newX) newVx *= -0.3;
    if (clampedY !== newY) newVy *= -0.3;
    newX = clampedX;
    newY = clampedY;

    const newDashCooldown = Math.max(0, butterfly.dashCooldown - 1);
    const newIsDashing = butterfly.isDashing && newDashCooldown > DASH_COOLDOWN - 10;

    let newGlideEnergy = butterfly.glideEnergy;
    let newIsGliding = butterfly.isGliding;
    if (butterfly.isGliding && abilityLevel.glideEfficiency > 0) {
      newGlideEnergy = Math.max(0, butterfly.glideEnergy - GLIDE_ENERGY_DRAIN);
      if (newGlideEnergy <= 0) {
        newIsGliding = false;
      }
    } else {
      newGlideEnergy = Math.min(MAX_GLIDE_ENERGY, butterfly.glideEnergy + GLIDE_ENERGY_REGEN);
    }

    set({
      butterfly: {
        ...butterfly,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        wingPhase: butterfly.wingPhase + 0.2 * (butterfly.isGliding ? 0.5 : 1),
        isDashing: newIsDashing,
        dashCooldown: newDashCooldown,
        isGliding: newIsGliding,
        glideEnergy: newGlideEnergy,
      },
    });
  },

  updateFragments: () => {
    const { fragments } = get();
    set({
      fragments: fragments.map((f) => ({
        ...f,
        glowPhase: f.glowPhase + 0.05,
        floatPhase: f.floatPhase + 0.03,
      })),
    });
  },

  updateFlowers: () => {
    const { flowers } = get();
    set({
      flowers: flowers.map((f) => ({
        ...f,
        swayPhase: f.swayPhase + 0.02,
        pulsePhase: f.pulsePhase + 0.03,
        bloomPhase: f.discovered ? Math.min(1, f.bloomPhase + 0.02) : f.bloomPhase,
      })),
    });
  },

  checkFragmentCollision: () => {
    const { butterfly, fragments, collectedFragments, unlockedStories } = get();
    const collectRadius = 45;

    for (const fragment of fragments) {
      if (fragment.collected) continue;
      const dx = butterfly.x - fragment.x;
      const dy = butterfly.y - fragment.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < collectRadius) {
        const story = getStoryByFragmentId(fragment.id);
        get().spawnCollectParticles(fragment.x, fragment.y, fragment.color);
        set({
          fragments: fragments.map((f) =>
            f.id === fragment.id ? { ...f, collected: true } : f
          ),
          collectedFragments: [...collectedFragments, fragment.id],
          unlockedStories: story
            ? [...unlockedStories, story.id]
            : unlockedStories,
          showStory: true,
          currentStory: story || null,
        });
        get().unlockDreamRegion(fragment.id);
        break;
      }
    }
  },

  spawnCollectParticles: (x, y, color) => {
    const { particles } = get();
    const newParticles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      const angle = (Math.PI * 2 * i) / 25;
      const speed = 1 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 5,
      });
    }
    set({ particles: [...particles, ...newParticles] });
  },

  updateParticles: () => {
    const { particles } = get();
    set({
      particles: particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.97,
          vy: p.vy * 0.97,
          life: p.life - 0.02,
        }))
        .filter((p) => p.life > 0),
    });
  },

  updatePetals: () => {
    const { petals, mapWidth, mapHeight } = get();
    set({
      petals: petals.map((p) => {
        let newX = p.x + p.vx + Math.sin(p.rotation) * 0.3;
        let newY = p.y + p.vy;
        if (newY > mapHeight + 50) {
          newY = -50;
          newX = Math.random() * mapWidth;
        }
        if (newX < -50) newX = mapWidth + 50;
        if (newX > mapWidth + 50) newX = -50;
        return {
          ...p,
          x: newX,
          y: newY,
          rotation: p.rotation + p.rotationSpeed,
        };
      }),
    });
  },

  updateFireflies: () => {
    const { fireflies, mapWidth, mapHeight } = get();
    set({
      fireflies: fireflies.map((f) => {
        let newX = f.x + f.vx + Math.sin(f.phase) * 0.2;
        let newY = f.y + f.vy + Math.cos(f.phase * 0.7) * 0.2;
        if (newX < 0 || newX > mapWidth) f.vx *= -1;
        if (newY < 0 || newY > mapHeight) f.vy *= -1;
        newX = Math.max(0, Math.min(mapWidth, newX));
        newY = Math.max(0, Math.min(mapHeight, newY));
        if (Math.random() < 0.01) {
          f.vx = (Math.random() - 0.5) * 0.4;
          f.vy = (Math.random() - 0.5) * 0.4;
        }
        return {
          ...f,
          x: newX,
          y: newY,
          phase: f.phase + 0.03,
          glow: (Math.sin(f.phase * 2) + 1) / 2,
        };
      }),
    });
  },

  updateCamera: () => {
    const { butterfly, cameraX, cameraY, viewportWidth, viewportHeight, mapWidth, mapHeight } = get();
    const targetX = butterfly.x;
    const targetY = butterfly.y;
    const lerpFactor = 0.08;

    let newCameraX = cameraX + (targetX - cameraX) * lerpFactor;
    let newCameraY = cameraY + (targetY - cameraY) * lerpFactor;

    const halfW = viewportWidth / 2;
    const halfH = viewportHeight / 2;
    newCameraX = Math.max(halfW, Math.min(mapWidth - halfW, newCameraX));
    newCameraY = Math.max(halfH, Math.min(mapHeight - halfH, newCameraY));

    set({ cameraX: newCameraX, cameraY: newCameraY });
  },

  startGame: () => {
    set({ isPlaying: true });
  },

  closeStory: () => set({ showStory: false, currentStory: null }),

  openStoryBook: () => set({ showStoryBook: true }),

  closeStoryBook: () => set({ showStoryBook: false }),

  openFlowerCard: (flowerId: string) => {
    const { flowers } = get();
    const flower = flowers.find((f) => f.id === flowerId);
    if (flower) {
      set({ showFlowerCard: true, currentFlower: flower });
    }
  },

  closeFlowerCard: () => set({ showFlowerCard: false, currentFlower: null }),

  discoverFlower: (flowerId: string) => {
    const { flowers, discoveredFlowers } = get();
    if (!discoveredFlowers.includes(flowerId)) {
      set({
        flowers: flowers.map((f) =>
          f.id === flowerId ? { ...f, discovered: true, bloomPhase: 0 } : f
        ),
        discoveredFlowers: [...discoveredFlowers, flowerId],
      });
    }
  },

  checkFlowerUnlocks: () => {
    const { flowers, collectedFragments, explorationProgress } = get();
    const collectedCount = collectedFragments.length;
    
    let hasChanges = false;
    const updatedFlowers = flowers.map((flower) => {
      if (!flower.unlocked) {
        const shouldUnlock = checkFlowerUnlock(flower, collectedCount, explorationProgress);
        if (shouldUnlock) {
          hasChanges = true;
          return { ...flower, unlocked: true };
        }
      }
      return flower;
    });

    if (hasChanges) {
      set({ flowers: updatedFlowers });
    }
  },

  updateFog: () => {
    const { butterfly, fogGrid, fogCellSize, baseVisibility, abilityLevel, companions, activeCompanionId } = get();
    const newGrid = fogGrid.map((row) => row.map((cell) => ({ ...cell })));
    let newExplored = 0;

    const activeCompanion = companions.find(c => c.id === activeCompanionId) || null;
    const companionBonus = getCompanionVisibilityBonus(activeCompanion);

    const playerCol = Math.floor(butterfly.x / fogCellSize);
    const playerRow = Math.floor(butterfly.y / fogCellSize);
    const visibilityRadius = baseVisibility * abilityLevel.visibilityMultiplier * companionBonus;
    const radiusInCells = Math.ceil(visibilityRadius / fogCellSize);

    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[row].length; col++) {
        const cell = newGrid[row][col];
        const dx = col - playerCol;
        const dy = row - playerRow;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radiusInCells) {
          const targetVisibility = Math.max(0, 1 - dist / radiusInCells);
          cell.visibility = Math.min(1, cell.visibility + (targetVisibility - cell.visibility) * 0.15);
          if (cell.visibility > 0.3 && !cell.explored) {
            cell.explored = true;
          }
        } else {
          cell.visibility = Math.max(0, cell.visibility * 0.995);
        }

        if (cell.explored) newExplored++;
      }
    }

    set({ fogGrid: newGrid, exploredCells: newExplored });
    get().updateExplorationProgress();
  },

  spawnRandomFragments: () => {
    const { fragments } = get();
    const maxRandomFragments = 4;
    const currentRandomCount = fragments.filter((f) => f.id.startsWith('fragment-random-') && !f.collected).length;
    const toSpawn = maxRandomFragments - currentRandomCount;

    if (toSpawn > 0) {
      const existingIds = fragments.map((f) => f.id);
      const newFragments = generateRandomFragments(toSpawn, existingIds);
      set({ fragments: [...fragments, ...newFragments] });
    }

    const cleanedFragments = fragments.filter((f) => {
      if (f.id.startsWith('fragment-random-') && f.collected) {
        return false;
      }
      return true;
    });
    if (cleanedFragments.length !== fragments.length) {
      set({ fragments: cleanedFragments });
    }
  },

  updateExplorationProgress: () => {
    const { exploredCells, totalCells } = get();
    const progress = Math.round((exploredCells / totalCells) * 100);
    set({ explorationProgress: progress });
  },

  dash: () => {
    const { butterfly, abilityLevel, abilities } = get();
    const dashAbility = abilities.find(a => a.id === 'dash');
    if (!dashAbility || !dashAbility.unlocked || butterfly.dashCooldown > 0) return;

    const speed = Math.sqrt(butterfly.vx * butterfly.vx + butterfly.vy * butterfly.vy);
    const dashPower = 12 * abilityLevel.dashPower;
    
    let dashVx = butterfly.vx;
    let dashVy = butterfly.vy;
    
    if (speed > 0.1) {
      dashVx = (butterfly.vx / speed) * dashPower;
      dashVy = (butterfly.vy / speed) * dashPower;
    } else {
      const angle = butterfly.rotation;
      dashVx = Math.cos(angle) * dashPower;
      dashVy = Math.sin(angle) * dashPower;
    }

    get().spawnDashParticles();

    set({
      butterfly: {
        ...butterfly,
        vx: dashVx,
        vy: dashVy,
        isDashing: true,
        dashCooldown: DASH_COOLDOWN,
      },
    });
  },

  setGliding: (isGliding) => {
    const { butterfly, abilities } = get();
    const glideAbility = abilities.find(a => a.id === 'glide');
    if (!glideAbility || !glideAbility.unlocked) return;
    if (isGliding && butterfly.glideEnergy <= 0) return;
    
    set({
      butterfly: {
        ...butterfly,
        isGliding,
      },
    });
  },

  spawnDashParticles: () => {
    const { butterfly, particles } = get();
    const newParticles: Particle[] = [];
    const angle = butterfly.rotation + Math.PI;
    
    for (let i = 0; i < 20; i++) {
      const spread = (Math.random() - 0.5) * 0.8;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        x: butterfly.x,
        y: butterfly.y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        life: 1,
        maxLife: 1,
        color: '#FFD700',
        size: 4 + Math.random() * 4,
      });
    }
    set({ particles: [...particles, ...newParticles] });
  },

  updateAbilityLevels: () => {
    const { collectedFragments, explorationProgress, abilities, showAbilityUnlock } = get();
    
    if (showAbilityUnlock) return;
    
    const collectedCount = collectedFragments.length;

    const speedLevel = getSpeedLevelByFragments(collectedCount);
    const visibilityLevel = getVisibilityLevelByExploration(explorationProgress);
    const dashLevel = getDashLevelByFragments(collectedCount);
    const glideLevel = getGlideLevelByExploration(explorationProgress);

    const newAbilityLevel = getAbilityLevelStats(speedLevel, visibilityLevel, dashLevel, glideLevel);
    
    let levelUpAbility: ButterflyAbility | null = null;
    
    const updatedAbilities = abilities.map(ability => {
      let newLevel = ability.level;
      if (ability.id === 'speed') newLevel = speedLevel;
      if (ability.id === 'visibility') newLevel = visibilityLevel;
      if (ability.id === 'dash') newLevel = dashLevel;
      if (ability.id === 'glide') newLevel = glideLevel;
      
      if (newLevel > ability.level && !levelUpAbility) {
        levelUpAbility = { ...ability, level: newLevel };
      }
      
      return { ...ability, level: newLevel };
    });

    set({ 
      abilityLevel: newAbilityLevel,
      abilities: updatedAbilities,
    });
    
    if (levelUpAbility) {
      set({
        showAbilityUnlock: true,
        unlockAbility: levelUpAbility,
      });
    }
  },

  checkAbilityUnlocks: () => {
    const { abilities, collectedFragments, explorationProgress } = get();
    const collectedCount = collectedFragments.length;
    
    let hasNewUnlock = false;
    let newUnlockAbility: ButterflyAbility | null = null;

    const updatedAbilities = abilities.map(ability => {
      if (!ability.unlocked) {
        const shouldUnlock = checkAbilityUnlock(ability, collectedCount, explorationProgress);
        if (shouldUnlock) {
          hasNewUnlock = true;
          newUnlockAbility = { ...ability, unlocked: true };
          return { ...ability, unlocked: true };
        }
      }
      return ability;
    });

    if (hasNewUnlock && newUnlockAbility) {
      set({ 
        abilities: updatedAbilities,
        showAbilityUnlock: true,
        unlockAbility: newUnlockAbility,
      });
      get().updateAbilityLevels();
    }
  },

  checkHiddenAreaDiscovery: () => {
    const { butterfly, hiddenAreas, abilities, companions, activeCompanionId } = get();
    
    const activeCompanion = companions.find(c => c.id === activeCompanionId) || null;
    const discoveryBonus = getCompanionDiscoveryBonus(activeCompanion);

    let hasChanges = false;
    const updatedAreas = hiddenAreas.map(area => {
      if (area.discovered) return area;

      const ability = abilities.find(a => a.id === area.requiredAbility);
      if (!ability || !ability.unlocked) return area;

      let abilityActive = false;
      switch (area.requiredAbility) {
        case 'dash':
          abilityActive = butterfly.isDashing;
          break;
        case 'glide':
          abilityActive = butterfly.isGliding;
          break;
        case 'visibility':
          abilityActive = ability.level >= 2;
          break;
        default:
          abilityActive = true;
      }

      if (!abilityActive) return area;

      const centerX = area.x + area.width / 2;
      const centerY = area.y + area.height / 2;
      const dx = butterfly.x - centerX;
      const dy = butterfly.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const detectRadius = (Math.max(area.width, area.height) / 2 + 50) * discoveryBonus;
      
      if (dist < detectRadius) {
        hasChanges = true;
        return { ...area, discovered: true };
      }
      return area;
    });

    if (hasChanges) {
      set({ hiddenAreas: updatedAreas });
    }
  },

  closeAbilityUnlock: () => set({ showAbilityUnlock: false, unlockAbility: null }),

  resetGame: () => {
    const newFog = createFogGrid();
    set({
      butterfly: createInitialButterfly(),
      fragments: INITIAL_FRAGMENTS.map((f) => ({ ...f, collected: false })),
      collectedFragments: [],
      unlockedStories: [],
      isPlaying: true,
      showStory: false,
      currentStory: null,
      showStoryBook: false,
      particles: [],
      flowers: createInitialFlowers(),
      discoveredFlowers: [],
      showFlowerCard: false,
      currentFlower: null,
      cameraX: START_REGION.x + START_REGION.width / 2,
      cameraY: START_REGION.y + START_REGION.height / 2,
      fogGrid: newFog.grid,
      exploredCells: 0,
      totalCells: newFog.total,
      explorationProgress: 0,
      abilities: [...INITIAL_ABILITIES],
      abilityLevel: getAbilityLevelStats(1, 1, 0, 0),
      hiddenAreas: [...INITIAL_HIDDEN_AREAS],
      showAbilityUnlock: false,
      unlockAbility: null,
      companions: [...INITIAL_COMPANIONS],
      activeCompanionId: null,
      showCompanionPanel: false,
      showCompanionEncounter: false,
      encounterCompanion: null,
      companionParticles: [],
      currentHint: null,
      showHint: false,
      lastHintTime: 0,
      dreamRegions: [...DREAM_REGIONS],
      dreamDecorations: generateRegionDecorations(START_REGION),
      dynamicParticles: [],
      showRegionUnlock: false,
      unlockRegion: null,
      mapBounds: getInitialMapBounds(),
    });
  },

  getActiveCompanion: () => {
    const { companions, activeCompanionId } = get();
    return companions.find(c => c.id === activeCompanionId) || null;
  },

  checkCompanionEncounters: () => {
  },

  updateCompanionEncounterProgress: () => {
    const { companions, collectedFragments, explorationProgress, abilities } = get();
    const collectedCount = collectedFragments.length;

    const updatedCompanions = companions.map(companion => {
      if (companion.unlocked) return companion;
      
      const progress = getCompanionEncounterProgress(companion, collectedCount, explorationProgress, abilities);
      
      return { ...companion, encounterProgress: progress };
    });

    set({ companions: updatedCompanions });
  },

  updateCompanions: () => {
    const { companions, butterfly } = get();
    const time = Date.now() / 1000;

    const updatedCompanions = companions.map(companion => {
      if (!companion.unlocked) return companion;
      
      const targetX = butterfly.x + Math.cos(time + companion.x * 0.01) * 60;
      const targetY = butterfly.y + Math.sin(time * 0.8 + companion.y * 0.01) * 40 - 50;
      
      const lerpFactor = 0.05;
      const newX = companion.x + (targetX - companion.x) * lerpFactor;
      const newY = companion.y + (targetY - companion.y) * lerpFactor;

      return { ...companion, x: newX, y: newY };
    });

    set({ companions: updatedCompanions });
  },

  unlockCompanion: (companionId: string) => {
    const { companions } = get();
    
    const updatedCompanions = companions.map(companion => {
      if (companion.id === companionId) {
        return { ...companion, unlocked: true };
      }
      return companion;
    });

    set({ companions: updatedCompanions });
  },

  setActiveCompanion: (companionId: string | null) => {
    set({ activeCompanionId: companionId });
  },

  openCompanionPanel: () => set({ showCompanionPanel: true }),

  closeCompanionPanel: () => set({ showCompanionPanel: false }),

  closeCompanionEncounter: () => {
    const { encounterCompanion, companions } = get();
    if (!encounterCompanion) {
      set({ showCompanionEncounter: false, encounterCompanion: null });
      return;
    }

    const cooldownMs = 60000;
    const updatedCompanions = companions.map(c => 
      c.id === encounterCompanion.id
        ? { ...c, encounterCooldownUntil: Date.now() + cooldownMs }
        : c
    );

    set({ 
      showCompanionEncounter: false, 
      encounterCompanion: null,
      companions: updatedCompanions,
    });
  },

  acceptCompanion: () => {
    const { encounterCompanion, butterfly } = get();
    if (!encounterCompanion) return;

    get().unlockCompanion(encounterCompanion.id);
    get().spawnCompanionParticles(encounterCompanion.x, encounterCompanion.y, encounterCompanion.color);
    
    set({
      activeCompanionId: encounterCompanion.id,
      showCompanionEncounter: false,
      encounterCompanion: null,
      companions: get().companions.map(c => 
        c.id === encounterCompanion.id 
          ? { ...c, x: butterfly.x, y: butterfly.y - 50, unlocked: true }
          : c
      ),
    });
  },

  spawnCompanionParticles: (x: number, y: number, color: string) => {
    const { companionParticles } = get();
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 4 + Math.random() * 6,
      });
    }
    set({ companionParticles: [...companionParticles, ...newParticles] });
  },

  updateCompanionParticles: () => {
    const { companionParticles } = get();
    set({
      companionParticles: companionParticles
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.96,
          vy: p.vy * 0.96,
          life: p.life - 0.015,
        }))
        .filter((p) => p.life > 0),
    });
  },

  checkCompanionProximity: () => {
    const { butterfly, companions, showCompanionEncounter } = get();
    if (showCompanionEncounter) return;

    const now = Date.now();

    for (const companion of companions) {
      if (companion.unlocked) continue;
      if (companion.encounterCooldownUntil > now) continue;
      
      const dx = butterfly.x - companion.x;
      const dy = butterfly.y - companion.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 80 && companion.encounterProgress >= 100) {
        set({
          showCompanionEncounter: true,
          encounterCompanion: { ...companion },
        });
        break;
      }
    }
  },

  triggerHint: () => {
    const { butterfly, fragments, flowers, hiddenAreas, companions, activeCompanionId, lastHintTime } = get();
    
    const activeCompanion = companions.find(c => c.id === activeCompanionId);
    if (!activeCompanion || activeCompanion.ability !== 'hint') {
      return;
    }

    const now = Date.now();
    const hintInterval = 8000;
    if (now - lastHintTime < hintInterval) {
      return;
    }

    const hint = generateHint(
      butterfly.x,
      butterfly.y,
      fragments,
      flowers,
      hiddenAreas,
      companions
    );

    if (hint) {
      set({
        currentHint: hint,
        showHint: true,
        lastHintTime: now,
      });

      const displayDuration = 6000;
      setTimeout(() => {
        const { currentHint: latestHint, lastHintTime: latestHintTime } = get();
        if (latestHint && latestHint.targetId === hint.targetId && now >= latestHintTime - 1000) {
          set({ showHint: false });
        }
      }, displayDuration);
    }
  },

  dismissHint: () => {
    set({ showHint: false });
  },

  unlockDreamRegion: (fragmentId: string) => {
    const { dreamRegions, dreamDecorations } = get();
    const region = getRegionByFragmentId(fragmentId);
    
    if (!region || region.unlocked) return;

    const newDecorations = generateRegionDecorations(region);
    const updatedRegions = dreamRegions.map((r) =>
      r.id === region.id ? { ...r, unlocked: true, animationPhase: 0 } : r
    );
    const newBounds = calculateMapBounds(updatedRegions);

    set({
      dreamRegions: updatedRegions,
      dreamDecorations: [...dreamDecorations, ...newDecorations],
      showRegionUnlock: true,
      unlockRegion: { ...region, unlocked: true },
      mapBounds: newBounds,
    });
  },

  closeRegionUnlock: () => {
    set({ showRegionUnlock: false, unlockRegion: null });
  },

  clampButterflyToBounds: () => {
    const { butterfly, mapBounds } = get();
    const margin = 50;
    const clampedX = Math.max(mapBounds.minX + margin, Math.min(mapBounds.maxX - margin, butterfly.x));
    const clampedY = Math.max(mapBounds.minY + margin, Math.min(mapBounds.maxY - margin, butterfly.y));
    if (clampedX !== butterfly.x || clampedY !== butterfly.y) {
      set({
        butterfly: {
          ...butterfly,
          x: clampedX,
          y: clampedY,
          vx: butterfly.vx * -0.3,
          vy: butterfly.vy * -0.3,
        },
      });
    }
  },

  updateRegionAnimation: () => {
    const { dreamRegions } = get();
    let needsUpdate = false;
    const updated = dreamRegions.map((r) => {
      if (r.unlocked && r.animationPhase !== undefined && r.animationPhase < 1) {
        needsUpdate = true;
        return { ...r, animationPhase: Math.min(1, (r.animationPhase || 0) + 0.02) };
      }
      return r;
    });
    if (needsUpdate) {
      set({ dreamRegions: updated });
    }
  },

  isInUnlockedRegion: (x: number, y: number) => {
    const { dreamRegions } = get();
    return dreamRegions.some(
      (r) =>
        r.unlocked &&
        x >= r.x &&
        x <= r.x + r.width &&
        y >= r.y &&
        y <= r.y + r.height
    );
  },

  updateDreamDecorations: () => {
    const { dreamDecorations } = get();
    set({
      dreamDecorations: dreamDecorations.map((d) => ({
        ...d,
        phase: d.phase + 0.02,
      })),
    });
  },

  spawnDynamicParticles: () => {
    const { dreamRegions, dynamicParticles } = get();
    const newParticles: DynamicParticle[] = [];

    for (const region of dreamRegions) {
      if (!region.unlocked || !region.hasDynamicTerrain) continue;

      if (Math.random() > 0.3) continue;

      const x = region.x + Math.random() * region.width;
      const y = region.y + Math.random() * region.height;

      let vx = 0;
      let vy = 0;
      let size = 3;
      let color = region.themeColor;
      let rotationSpeed = 0.02;
      let maxLife = 200;

      switch (region.dynamicType) {
        case 'petals':
          vx = (Math.random() - 0.5) * 0.5;
          vy = 0.3 + Math.random() * 0.5;
          size = 6 + Math.random() * 8;
          color = '#FFB6C8';
          rotationSpeed = (Math.random() - 0.5) * 0.05;
          maxLife = 300;
          break;
        case 'leaves':
          vx = (Math.random() - 0.5) * 0.8;
          vy = 0.5 + Math.random() * 0.7;
          size = 5 + Math.random() * 7;
          color = '#FF8C42';
          rotationSpeed = (Math.random() - 0.5) * 0.08;
          maxLife = 250;
          break;
        case 'snowflakes':
          vx = (Math.random() - 0.5) * 0.3;
          vy = 0.2 + Math.random() * 0.4;
          size = 2 + Math.random() * 4;
          color = '#FFFFFF';
          rotationSpeed = (Math.random() - 0.5) * 0.03;
          maxLife = 400;
          break;
        case 'bloom':
        case 'sway':
        case 'rainbow':
          vx = 0;
          vy = -0.2 - Math.random() * 0.3;
          size = 2 + Math.random() * 3;
          color = region.themeColor;
          maxLife = 150;
          break;
      }

      newParticles.push({
        x,
        y,
        vx,
        vy,
        size,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        life: maxLife,
        maxLife,
        type: region.dynamicType,
      });
    }

    if (newParticles.length > 0) {
      set({ dynamicParticles: [...dynamicParticles, ...newParticles] });
    }
  },

  updateDynamicParticles: () => {
    const { dynamicParticles, dreamRegions } = get();
    
    const updatedParticles = dynamicParticles
      .map((p) => {
        const newX = p.x + p.vx;
        const newY = p.y + p.vy;
        const newLife = p.life - 1;
        const newRotation = p.rotation + p.rotationSpeed;

        let newVx = p.vx;
        const newVy = p.vy;

        if (p.type === 'petals' || p.type === 'leaves') {
          newVx += Math.sin(newLife * 0.05) * 0.02;
        }

        const inRegion = dreamRegions.some(
          (r) =>
            r.unlocked &&
            newX >= r.x - 20 &&
            newX <= r.x + r.width + 20 &&
            newY >= r.y - 20 &&
            newY <= r.y + r.height + 20
        );

        if (!inRegion && newLife < p.maxLife * 0.7) {
          return { ...p, life: -1 };
        }

        return {
          ...p,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          rotation: newRotation,
          life: newLife,
        };
      })
      .filter((p) => p.life > 0);

    set({ dynamicParticles: updatedParticles });
  },
}));
