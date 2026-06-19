export interface Butterfly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  wingPhase: number;
  isDashing: boolean;
  dashCooldown: number;
  isGliding: boolean;
  glideEnergy: number;
}

export interface ButterflyAbility {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockCondition: string;
  icon: string;
  level: number;
  maxLevel: number;
}

export interface HiddenArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  requiredAbility: string;
  discovered: boolean;
  color: string;
  description: string;
}

export interface AbilityLevel {
  speedMultiplier: number;
  visibilityMultiplier: number;
  dashPower: number;
  glideEfficiency: number;
}

export interface Fragment {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  storyId: string;
  glowPhase: number;
  floatPhase: number;
  color: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  fragmentId: string;
  order: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
}

export interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  glow: number;
}

export interface Flower {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  petalCount: number;
  swayPhase: number;
  type: string;
  name: string;
  unlocked: boolean;
  discovered: boolean;
  unlockCondition: string;
  memory: string;
  knowledge: string;
  flowerLanguage: string;
  bloomPhase: number;
  pulsePhase: number;
}

export interface Tree {
  x: number;
  y: number;
  size: number;
  type: 'round' | 'pine' | 'cherry';
}

export interface FogCell {
  x: number;
  y: number;
  explored: boolean;
  visibility: number;
}

export type CompanionAbility = 'light' | 'discover' | 'hint';

export type CompanionPersonality = 'curious' | 'calm' | 'playful' | 'wise' | 'shy';

export type HintType = 'fragment' | 'flower' | 'hidden' | 'companion';

export interface HintInfo {
  type: HintType;
  targetId: string;
  targetName: string;
  direction: string;
  distance: number;
  hintText: string;
}

export interface ButterflyCompanion {
  id: string;
  name: string;
  personality: CompanionPersonality;
  ability: CompanionAbility;
  description: string;
  color: string;
  wingColor: string;
  spotColor: string;
  unlocked: boolean;
  x: number;
  y: number;
  encounterCondition: string;
  encounterProgress: number;
  encounterTarget: number;
  abilityPower: number;
  quote: string;
  encounterCooldownUntil: number;
}

export interface CompanionState {
  companions: ButterflyCompanion[];
  activeCompanionId: string | null;
  showCompanionPanel: boolean;
  showCompanionEncounter: boolean;
  encounterCompanion: ButterflyCompanion | null;
  companionParticles: Particle[];
  currentHint: HintInfo | null;
  showHint: boolean;
  lastHintTime: number;
}

export type TerrainType = 'garden' | 'field' | 'valley' | 'lake' | 'bridge';
export type DynamicTerrainType = 'petals' | 'bloom' | 'sway' | 'leaves' | 'snowflakes' | 'rainbow';

export interface DreamDecoration {
  id: string;
  type: 'tree' | 'flower' | 'rock' | 'bush';
  x: number;
  y: number;
  size: number;
  color: string;
  phase: number;
}

export type ConnectDirection = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

export interface DreamRegion {
  id: string;
  name: string;
  description: string;
  fragmentId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  unlocked: boolean;
  themeColor: string;
  bgColor: string;
  terrainType: TerrainType;
  hasDynamicTerrain: boolean;
  dynamicType: DynamicTerrainType;
  decorationCount: number;
  order: number;
  isStart?: boolean;
  connectsTo?: string[];
  connectDirection?: ConnectDirection;
  unlockProgress?: number;
  animationPhase?: number;
}

export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface DynamicParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  type: DynamicTerrainType;
}

export type LightBeamColor = 'gold' | 'blue' | 'pink';

export interface LightSource {
  id: string;
  x: number;
  y: number;
  angle: number;
  color: LightBeamColor;
  beamLength: number;
  beamWidth: number;
  movingPattern: 'circular' | 'linear' | 'none';
  moveRadius: number;
  moveSpeed: number;
  movePhase: number;
  originX: number;
  originY: number;
  active: boolean;
  playerControlled: boolean;
  pulsePhase: number;
}

export interface GiantFlower {
  id: string;
  x: number;
  y: number;
  size: number;
  petalCount: number;
  color: string;
  name: string;
  reflectColor: LightBeamColor;
  swayPhase: number;
  bloomPhase: number;
  lit: boolean;
  litIntensity: number;
  discovered: boolean;
}

export interface HiddenPath {
  id: string;
  points: { x: number; y: number }[];
  requiredColor: LightBeamColor;
  revealed: boolean;
  revealProgress: number;
  width: number;
}

export interface MemoryText {
  id: string;
  x: number;
  y: number;
  text: string;
  requiredColor: LightBeamColor;
  revealed: boolean;
  revealProgress: number;
  fontSize: number;
}

export interface LightMechanism {
  id: string;
  x: number;
  y: number;
  size: number;
  requiredColor: LightBeamColor;
  activated: boolean;
  activateProgress: number;
  type: 'gate' | 'bridge' | 'portal' | 'bloom';
  targetId: string;
  pulsePhase: number;
}

export interface PhantomSnapshot {
  x: number;
  y: number;
  rotation: number;
  wingPhase: number;
  isDashing: boolean;
  isGliding: boolean;
  action: 'move' | 'dash' | 'glide' | 'interact' | 'idle';
}

export interface PhantomTrail {
  id: string;
  snapshots: PhantomSnapshot[];
  regionId: string;
  createdAt: number;
  playCount: number;
  activeSnapshotIndex: number;
  isPlaying: boolean;
  fadePhase: number;
}

export interface EchoPuzzle {
  id: string;
  x: number;
  y: number;
  size: number;
  phantomZoneX: number;
  phantomZoneY: number;
  phantomZoneRadius: number;
  butterflyZoneX: number;
  butterflyZoneY: number;
  butterflyZoneRadius: number;
  requiredTrailRegionId: string;
  activated: boolean;
  activateProgress: number;
  type: 'memory' | 'resonance' | 'mirror';
  targetId: string;
  pulsePhase: number;
  hint: string;
}

export interface MemoryEchoState {
  phantomTrails: PhantomTrail[];
  echoPuzzles: EchoPuzzle[];
  isRecording: boolean;
  currentRecordingSnapshots: PhantomSnapshot[];
  currentRecordingRegionId: string | null;
  recordingFrameCounter: number;
  echoParticles: Particle[];
  showEchoHint: boolean;
  echoHintText: string | null;
}

export interface LightPuzzleState {
  lightSources: LightSource[];
  giantFlowers: GiantFlower[];
  hiddenPaths: HiddenPath[];
  memoryTexts: MemoryText[];
  lightMechanisms: LightMechanism[];
  activeLightId: string | null;
  showLightPuzzleHint: boolean;
}

export interface GameState extends CompanionState, LightPuzzleState, MemoryEchoState {
  butterfly: Butterfly;
  fragments: Fragment[];
  collectedFragments: string[];
  unlockedStories: string[];
  isPlaying: boolean;
  showStory: boolean;
  currentStory: Story | null;
  showStoryBook: boolean;
  particles: Particle[];
  petals: Petal[];
  fireflies: Firefly[];
  flowers: Flower[];
  discoveredFlowers: string[];
  showFlowerCard: boolean;
  currentFlower: Flower | null;
  mapWidth: number;
  mapHeight: number;
  cameraX: number;
  cameraY: number;
  viewportWidth: number;
  viewportHeight: number;
  fogGrid: FogCell[][];
  fogCellSize: number;
  exploredCells: number;
  totalCells: number;
  explorationProgress: number;
  abilities: ButterflyAbility[];
  abilityLevel: AbilityLevel;
  hiddenAreas: HiddenArea[];
  showAbilityUnlock: boolean;
  unlockAbility: ButterflyAbility | null;
  baseSpeed: number;
  baseVisibility: number;
  dreamRegions: DreamRegion[];
  dreamDecorations: DreamDecoration[];
  dynamicParticles: DynamicParticle[];
  showRegionUnlock: boolean;
  unlockRegion: DreamRegion | null;
  mapBounds: MapBounds;
}
