import { Creature, getCreaturesAtDepth, CreatureRarity } from '@/data/creatures';
import { RARITY_CONFIG } from '@/constants/gameConfig';

const COLLECTION_STORAGE_KEY = 'deepDiveCollection';

// Rarity weights - uses exponential scaling so Epic/Legendary overtake Rare at deep depths
const getRarityWeight = (rarity: CreatureRarity, depth: number): number => {
  const depthRatio = depth / RARITY_CONFIG.DEPTH_DIVISOR; // Normalize: 0 at surface, 1.0 at 1000m, 1.5 at 1500m
  
  switch (rarity) {
    case 'Common':
      // Fast linear decay: dominant at surface, nearly gone by 1000m
      return Math.max(
        RARITY_CONFIG.WEIGHTS.COMMON.minimum,
        RARITY_CONFIG.WEIGHTS.COMMON.base - depthRatio * 0.95
      );
    case 'Uncommon':
      // Gentle increase, plateaus at deep depths
      return 0.4 + Math.min(depthRatio, 1.0) * 0.2;
    case 'Rare':
      // Moderate linear increase
      return RARITY_CONFIG.WEIGHTS.RARE.base + depthRatio * RARITY_CONFIG.WEIGHTS.RARE.depthMultiplier;
    case 'Epic':
      // Exponential scaling (^1.5) - overtakes Rare around 800m
      return 0.1 + Math.pow(depthRatio, 1.5) * 0.7;
    case 'Legendary':
      // Strongest exponential (^2) - overtakes all at max depth
      return RARITY_CONFIG.WEIGHTS.LEGENDARY.base + Math.pow(depthRatio, 2) * RARITY_CONFIG.WEIGHTS.LEGENDARY.depthMultiplier;
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

// Get pearl value - now uses the creature's direct pearl value
export const getPearlValue = (rarity: CreatureRarity, creature?: Creature): number => {
  // If creature is provided, use its pearl value directly
  if (creature) {
    return creature.pearls;
  }
  // Fallback to default values for backwards compatibility
  const defaults: Record<CreatureRarity, number> = {
    Common: 10,
    Uncommon: 40,
    Rare: 60,
    Epic: 100,
    Legendary: 200,
  };
  return defaults[rarity] ?? 10;
};
