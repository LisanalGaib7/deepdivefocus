import { Creature, getCreaturesAtDepth, CreatureRarity } from '@/data/creatures';
import { RARITY_CONFIG, PEARL_VALUES } from '@/constants/gameConfig';

const COLLECTION_STORAGE_KEY = 'deepDiveCollection';

// Rarity weights - higher depth increases rare/legendary chances
const getRarityWeight = (rarity: CreatureRarity, depth: number): number => {
  const depthBonus = depth / RARITY_CONFIG.DEPTH_DIVISOR;
  
  switch (rarity) {
    case 'Common':
      return Math.max(
        RARITY_CONFIG.WEIGHTS.COMMON.minimum,
        RARITY_CONFIG.WEIGHTS.COMMON.base + depthBonus * RARITY_CONFIG.WEIGHTS.COMMON.depthMultiplier
      );
    case 'Rare':
      return RARITY_CONFIG.WEIGHTS.RARE.base + depthBonus * RARITY_CONFIG.WEIGHTS.RARE.depthMultiplier;
    case 'Legendary':
      return RARITY_CONFIG.WEIGHTS.LEGENDARY.base + depthBonus * RARITY_CONFIG.WEIGHTS.LEGENDARY.depthMultiplier;
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

// Get pearl value based on rarity
export const getPearlValue = (rarity: CreatureRarity): number => {
  return PEARL_VALUES[rarity] ?? PEARL_VALUES.Common;
};
