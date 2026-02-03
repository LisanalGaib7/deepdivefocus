import { Creature, getCreaturesAtDepth, CreatureRarity } from '@/data/creatures';
import { RARITY_CONFIG, PEARL_VALUES } from '@/constants/gameConfig';

const COLLECTION_STORAGE_KEY = 'deepDiveCollection';

// Rarity weights calibrated for exact percentages at 3000m max depth:
// Legendary: 7%, Epic: 13%, Rare: 30%, Common+Uncommon: 50%
const getRarityWeight = (rarity: CreatureRarity, depth: number): number => {
  const depthRatio = depth / RARITY_CONFIG.DEPTH_DIVISOR; // 0 at surface, 3.0 at 3000m
  
  switch (rarity) {
    case 'Common':
      // Decay from 1.0 → 0.5 (64% at surface → 5% at max)
      return Math.max(0.1, 1.0 - depthRatio * 0.167);
    case 'Uncommon':
      // Linear growth: 0.4 → 4.5 (26% at surface → 45% at max)
      return 0.4 + depthRatio * 1.367;
    case 'Rare':
      // Linear growth: 0.1 → 3.0 (6% at surface → 30% at max)
      return 0.1 + depthRatio * 0.967;
    case 'Epic':
      // Exponential (^1.5): 0.05 → 1.3 (3% at surface → 13% at max)
      return 0.05 + Math.pow(depthRatio, 1.5) * 0.24;
    case 'Legendary':
      // Strongest exponential (^2): 0.01 → 0.7 (0.6% at surface → 7% at max)
      return 0.01 + Math.pow(depthRatio, 2) * 0.0767;
    default:
      return 1;
  }
};

// Roll for a random creature based on depth reached
export const rollForCreature = (maxDepth: number): Creature | null => {
  const availableCreatures = getCreaturesAtDepth(maxDepth);
  
  if (availableCreatures.length === 0) return null;
  
  // Calculate weighted probabilities
  const weightedCreatures = availableCreatures.map(creature => ({
    creature,
    weight: getRarityWeight(creature.rarity, maxDepth),
  }));
  
  const totalWeight = weightedCreatures.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of weightedCreatures) {
    random -= item.weight;
    if (random <= 0) {
      return item.creature;
    }
  }
  
  // Fallback to first creature
  return availableCreatures[0];
};

// Get collected creatures from localStorage
export const getCollection = (): string[] => {
  const saved = localStorage.getItem(COLLECTION_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

// Add a creature to the collection
export const addToCollection = (creatureId: string): void => {
  const collection = getCollection();
  if (!collection.includes(creatureId)) {
    collection.push(creatureId);
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection));
  }
};

// Check if creature is already collected
export const isCreatureCollected = (creatureId: string): boolean => {
  return getCollection().includes(creatureId);
};

// Get pearl value - always derived from rarity tier (single source of truth)
export const getPearlValue = (rarity: CreatureRarity): number => {
  return PEARL_VALUES[rarity] ?? PEARL_VALUES.Common;
};
