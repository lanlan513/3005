import { create } from 'zustand';
import { GameState, Butterfly, Fragment, Particle, Petal, Firefly } from '../types/game';
import { INITIAL_FRAGMENTS, MAP_WIDTH, MAP_HEIGHT } from '../data/fragments';
import { getStoryByFragmentId } from '../data/stories';

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

  resetGame: () => {
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
    });
  },
}));
