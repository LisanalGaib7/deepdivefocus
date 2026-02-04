import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Anchor, 
  Shield, 
  Zap, 
  ChevronRight,
  Gauge,
  ArrowUp,
  Lock,
  Circle
} from "lucide-react";
import { getUpgradeCost, getHullMaxDepth, getEngineSpeedPercent } from "@/constants/gameConfig";

interface UpgradeModule {
  id: string;
  name: string;
  icon: typeof Shield;
  currentTier: number;
  maxTier: number;
  currentValue: string;
  nextValue: string;
  description: string;
  cost: number;
  unlocked: boolean;
}

interface EngineeringBayModalProps {
  open: boolean;
  onClose: () => void;
  engineLevel: number;
  hullLevel: number;
  currentPearls: number;
  onUpgrade?: (moduleId: string) => void;
}

export const EngineeringBayModal = ({
  open,
  onClose,
  engineLevel,
  hullLevel,
  currentPearls,
  onUpgrade,
}: EngineeringBayModalProps) => {
  const [upgrading, setUpgrading] = useState<string | null>(null);

  // Calculate stats based on tier using centralized helpers
  const currentMaxDepth = getHullMaxDepth(hullLevel);
  const nextMaxDepth = getHullMaxDepth(hullLevel + 1);
  const currentSpeed = getEngineSpeedPercent(engineLevel);
  const nextSpeed = getEngineSpeedPercent(engineLevel + 1);

  // Define upgrade modules with hardcore pricing
  const modules: UpgradeModule[] = [
    {
      id: "hull",
      name: "HULL REINFORCEMENT",
      icon: Shield,
      currentTier: hullLevel,
      maxTier: 5,
      currentValue: `${currentMaxDepth.toLocaleString()}m`,
      nextValue: `${nextMaxDepth.toLocaleString()}m`,
      description: "Advanced titanium plating to withstand crushing depths.",
      cost: getUpgradeCost(hullLevel),
      unlocked: true,
    },
    {
      id: "engine",
      name: "ION THRUSTER",
      icon: Zap,
      currentTier: engineLevel,
      maxTier: 5,
      currentValue: `${currentSpeed}%`,
      nextValue: `${nextSpeed}%`,
      description: "Upgraded propulsion system for faster descent speed.",
      cost: getUpgradeCost(engineLevel),
      unlocked: true,
    },
    {
      id: "oxygen",
      name: "O₂ RECYCLER",
      icon: Gauge,
      currentTier: 1,
      maxTier: 5,
      currentValue: "100%",
      nextValue: "120%",
      description: "Enhanced life support for extended dive operations.",
      cost: getUpgradeCost(1), // Locked at tier 1
      unlocked: false,
    },
  ];

  const handleUpgrade = async (moduleId: string) => {
    setUpgrading(moduleId);
    // Simulate upgrade animation
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpgrade?.(moduleId);
    setUpgrading(null);
  };

  const canAfford = (cost: number) => currentPearls >= cost;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-black/95 border-cyan-500/30 max-w-lg max-h-[90vh] overflow-y-auto p-0 scrollbar-deep-sea">
        {/* Blueprint grid background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--hud-cyan)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--hud-cyan)) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        {/* Header */}
        <DialogHeader className="relative p-6 pb-4 border-b border-cyan-500/20">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-lg p-2">
              <Anchor className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>
          <DialogTitle className="text-center font-robotic text-xl tracking-[0.3em] text-cyan-400">
            ENGINEERING BAY
          </DialogTitle>
        </DialogHeader>

        {/* Vessel Stats Panel */}
        <div className="p-6 pt-4 space-y-6">
          {/* Submarine wireframe representation */}
          <div className="relative bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-cyan-400/60 font-robotic tracking-wider">VESSEL CLASS</p>
                <p className="text-lg font-robotic text-cyan-400 tracking-wide">VOYAGER-{hullLevel}</p>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5">
                <Circle className="h-4 w-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                <span className="text-amber-400 font-robotic text-sm">{currentPearls.toLocaleString()}</span>
              </div>
            </div>

            {/* Current Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 text-center">
                <p className="text-[10px] text-cyan-400/50 font-robotic tracking-wider mb-1">MAX DEPTH</p>
                <p className="text-lg font-robotic text-amber-400">{currentMaxDepth.toLocaleString()}m</p>
              </div>
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 text-center">
                <p className="text-[10px] text-cyan-400/50 font-robotic tracking-wider mb-1">DIVE SPEED</p>
                <p className="text-lg font-robotic text-cyan-400">{currentSpeed}%</p>
              </div>
            </div>
          </div>

          {/* Upgrade Modules List */}
          <div className="space-y-3">
            <p className="text-xs text-cyan-400/60 font-robotic tracking-[0.2em] uppercase">
              Available Upgrades
            </p>
            
            {modules.map((module) => {
              const IconComponent = module.icon;
              const isMaxed = module.currentTier >= module.maxTier;
              const affordable = canAfford(module.cost);
              const isUpgrading = upgrading === module.id;

              return (
                <div 
                  key={module.id}
                  className={`
                    relative bg-black/60 border rounded-xl p-4 transition-all duration-300
                    ${!module.unlocked ? 'border-white/10 opacity-50' : 
                      isMaxed ? 'border-green-500/30' : 
                      'border-cyan-500/20 hover:border-cyan-500/40'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                      p-2.5 rounded-lg shrink-0
                      ${!module.unlocked ? 'bg-white/5' :
                        isMaxed ? 'bg-green-500/10 border border-green-500/30' :
                        'bg-cyan-500/10 border border-cyan-500/30'}
                    `}>
                      {!module.unlocked ? (
                        <Lock className="h-5 w-5 text-white/30" />
                      ) : (
                        <IconComponent className={`h-5 w-5 ${isMaxed ? 'text-green-400' : 'text-cyan-400'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`font-robotic text-sm tracking-wider ${
                          !module.unlocked ? 'text-white/30' :
                          isMaxed ? 'text-green-400' : 'text-white'
                        }`}>
                          {module.name}
                        </h3>
                        <span className={`text-xs font-robotic ${
                          isMaxed ? 'text-green-400/60' : 'text-cyan-400/60'
                        }`}>
                          TIER {module.currentTier}/{module.maxTier}
                        </span>
                      </div>
                      
                      <p className="text-xs text-white/40 mb-3 leading-relaxed">
                        {module.description}
                      </p>

                      {/* Upgrade preview */}
                      {!isMaxed && module.unlocked && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-white/50">{module.currentValue}</span>
                            <ChevronRight className="h-3 w-3 text-amber-400" />
                            <span className="text-amber-400 font-medium">{module.nextValue}</span>
                          </div>
                          
                          <Button
                            size="sm"
                            disabled={!affordable || isUpgrading}
                            onClick={() => handleUpgrade(module.id)}
                            className={`
                              h-8 px-4 font-robotic text-xs tracking-wider transition-all duration-300
                              ${affordable 
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                                : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'}
                            `}
                          >
                            {isUpgrading ? (
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                <span>UPGRADING</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Circle className="h-3 w-3 fill-current drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                                <span>{module.cost}</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      )}

                      {isMaxed && module.unlocked && (
                        <p className="text-xs text-green-400/60 font-robotic tracking-wider">
                          ✓ MAXIMUM TIER REACHED
                        </p>
                      )}

                      {!module.unlocked && (
                        <p className="text-xs text-white/30 font-robotic tracking-wider">
                          🔒 LOCKED — COMING SOON
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Close button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent border border-cyan-500/30 text-cyan-400/80 font-robotic uppercase tracking-widest h-11 transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-500/50"
          >
            CLOSE BAY
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EngineeringBayModal;
