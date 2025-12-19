import { Creature, getCreaturesAtDepth, CreatureRarity } from '@/data/creatures';

const COLLECTION_STORAGE_KEY = 'deepDiveCollection';

// Rarity weights - higher depth increases rare/legendary chances
const getRarityWeight = (rarity: CreatureRarity, depth: number): number => {
  const depthBonus = depth / 1000; // 0 to ~1.5 bonus based on depth
  
  switch (rarity) {
    case 'Common':
      return Math.max(0.1, 1 - depthBonus * 0.5); // Decreases with depth
    case 'Rare':
      return 0.5 + depthBonus * 0.3; // Increases with depth
    case 'Legendary':
      return 0.1 + depthBonus * 0.5; // Significantly increases with depth
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
  switch (rarity) {
    case 'Common':
      return 10;
    case 'Rare':
      return 50;
    case 'Legendary':
      return 200;
    default:
      return 10;
  }
};
