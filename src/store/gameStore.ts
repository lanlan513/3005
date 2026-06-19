import { create } from 'zustand';
import { GameState, Butterfly, Fragment, Particle, Petal, Firefly, FogCell } from '../types/game';
import { INITIAL_FRAGMENTS, MAP_WIDTH, MAP_HEIGHT } from '../data/fragments';
import { getStoryByFragmentId } from '../data/stories';

const FOG_CELL_SIZE = 40;
const VISIBILITY_RADIUS = 120;
const FRAGMENT_RESPAWN_INTERVAL = 15000;

const createInitialButterfly = (): Butterfly => ({
  x: 200,
  y: 1600,
  vx: 0,
  vy: 0,
  rotation: -Math.PI / 4,
  wingPhase: 0,
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
  spawnCollectParticles: (x: number, y: number, color: string) => void;
  updateCamera: () => void;
  setViewport: (w: number, h: number) => void;
  startGame: () => void;
  closeStory: () => void;
  openStoryBook: () => void;
  closeStoryBook: () => void;
  resetGame: () => void;
  updateFog: () => void;
  spawnRandomFragments: () => void;
  updateExplorationProgress: () => void;
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
  mapWidth: MAP_WIDTH,
  mapHeight: MAP_HEIGHT,
  cameraX: 200,
  cameraY: 1600,
  viewportWidth: 800,
  viewportHeight: 600,
  fogGrid: initialFog.grid,
  fogCellSize: FOG_CELL_SIZE,
  exploredCells: 0,
  totalCells: initialFog.total,
  explorationProgress: 0,

  setViewport: (w, h) => set({ viewportWidth: w, viewportHeight: h }),

  setButterflyVelocity: (vx, vy) => {
    const { butterfly } = get();
    const speed = Math.sqrt(vx * vx + vy * vy);
    const maxSpeed = 4;
    if (speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed;
      vy = (vy / speed) * maxSpeed;
    }
    set({
      butterfly: {
        ...butterfly,
        vx,
        vy,
        rotation: speed > 0.1 ? Math.atan2(vy, vx) : butterfly.rotation,
        wingPhase: butterfly.wingPhase + (speed > 0.1 ? 0.4 : 0.15),
      },
    });
  },

  updateButterfly: () => {
    const { butterfly, mapWidth, mapHeight } = get();
    const friction = 0.92;
    let newX = butterfly.x + butterfly.vx;
    let newY = butterfly.y + butterfly.vy;
    const newVx = butterfly.vx * friction;
    const newVy = butterfly.vy * friction;

    const margin = 50;
    newX = Math.max(margin, Math.min(mapWidth - margin, newX));
    newY = Math.max(margin, Math.min(mapHeight - margin, newY));

    set({
      butterfly: {
        ...butterfly,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        wingPhase: butterfly.wingPhase + 0.2,
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

  updateFog: () => {
    const { butterfly, fogGrid, fogCellSize } = get();
    const newGrid = fogGrid.map((row) => row.map((cell) => ({ ...cell })));
    let newExplored = 0;

    const playerCol = Math.floor(butterfly.x / fogCellSize);
    const playerRow = Math.floor(butterfly.y / fogCellSize);
    const radiusInCells = Math.ceil(VISIBILITY_RADIUS / fogCellSize);

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
    const { fragments, collectedFragments } = get();
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
      cameraX: 200,
      cameraY: 1600,
      fogGrid: newFog.grid,
      exploredCells: 0,
      totalCells: newFog.total,
      explorationProgress: 0,
    });
  },
}));
