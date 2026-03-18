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
      cost: getUpgradeCost(1),
      unlocked: false,
    },
  ];

  const handleUpgrade = async (moduleId: string) => {
    setUpgrading(moduleId);
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpgrade?.(moduleId);
    setUpgrading(null);
  };

  const canAfford = (cost: number) => currentPearls >= cost;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-background border-2 border-primary/60 max-w-lg max-h-[90vh] overflow-y-auto p-0 scrollbar-deep-sea transition-colors duration-500 shadow-[0_0_25px_hsl(var(--primary)/0.3),0_0_50px_hsl(var(--primary)/0.15),inset_0_0_15px_hsl(var(--primary)/0.05)]">

        {/* Header */}
        <DialogHeader className="relative p-6 pb-4 border-b border-primary/20 transition-colors duration-500">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-colors duration-500" />
            <div className="bg-primary/10 border border-primary/50 rounded-lg p-2 transition-colors duration-500">
              <Anchor className="h-5 w-5 text-primary transition-colors duration-500" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-colors duration-500" />
          </div>
          <DialogTitle className="text-center font-robotic text-xl tracking-[0.3em] text-primary transition-colors duration-500">
            ENGINEERING BAY
          </DialogTitle>
        </DialogHeader>

        {/* Vessel Stats Panel */}
        <div className="p-6 pt-4 space-y-6">
          {/* Submarine wireframe representation */}
          <div className="relative bg-background border-2 border-primary/50 rounded-xl p-4 transition-colors duration-500 shadow-[0_0_15px_hsl(var(--primary)/0.25),0_0_30px_hsl(var(--primary)/0.1),inset_0_0_10px_hsl(var(--primary)/0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-primary/60 font-robotic tracking-wider transition-colors duration-500">VESSEL CLASS</p>
                <p className="text-lg font-robotic text-primary tracking-wide transition-colors duration-500">VOYAGER-{hullLevel}</p>
              </div>
              <div className="flex items-center gap-2 bg-pearl/10 border border-pearl/30 rounded-lg px-3 py-1.5 transition-colors duration-500">
                <Circle className="h-4 w-4 text-pearl fill-pearl drop-shadow-[0_0_5px_hsl(var(--pearl)/0.8)] transition-colors duration-500" />
                <span className="text-pearl font-robotic text-sm transition-colors duration-500">{currentPearls.toLocaleString()}</span>
              </div>
            </div>

            {/* Current Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background border border-primary/20 rounded-lg p-3 text-center transition-colors duration-500">
                <p className="text-[10px] text-primary/50 font-robotic tracking-wider mb-1 transition-colors duration-500">MAX DEPTH</p>
                <p className="text-lg font-robotic text-pearl transition-colors duration-500">{currentMaxDepth.toLocaleString()}m</p>
              </div>
              <div className="bg-background border border-primary/20 rounded-lg p-3 text-center transition-colors duration-500">
                <p className="text-[10px] text-primary/50 font-robotic tracking-wider mb-1 transition-colors duration-500">DIVE SPEED</p>
                <p className="text-lg font-robotic text-primary transition-colors duration-500">{currentSpeed}%</p>
              </div>
            </div>
          </div>

          {/* Upgrade Modules List */}
          <div className="space-y-3">
            <p className="text-xs text-primary/60 font-robotic tracking-[0.2em] uppercase transition-colors duration-500">
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
                    relative bg-background border-2 rounded-xl p-4 transition-all duration-500
                    ${!module.unlocked ? 'border-muted-foreground/20 opacity-50' : 
                      isMaxed ? 'border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.2)]' : 
                      'border-primary/40 hover:border-primary/70 shadow-[0_0_15px_hsl(var(--primary)/0.2),0_0_30px_hsl(var(--primary)/0.08)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.35),0_0_40px_hsl(var(--primary)/0.15)]'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                      p-2.5 rounded-lg shrink-0 transition-colors duration-500
                      ${!module.unlocked ? 'bg-muted' :
                        isMaxed ? 'bg-primary/10 border border-primary/30' :
                        'bg-primary/10 border border-primary/30'}
                    `}>
                      {!module.unlocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <IconComponent className={`h-5 w-5 transition-colors duration-500 ${isMaxed ? 'text-primary' : 'text-primary'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`font-robotic text-sm tracking-wider transition-colors duration-500 ${
                          !module.unlocked ? 'text-white/30' :
                          isMaxed ? 'text-green-400' : 'text-white'
                        }`}>
                          {module.name}
                        </h3>
                        <span className={`text-xs font-robotic transition-colors duration-500 ${
                          isMaxed ? 'text-green-400/60' : 'text-primary/60'
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
                            <ChevronRight className="h-3 w-3 text-pearl" />
                            <span className="text-pearl font-medium">{module.nextValue}</span>
                          </div>
                          
                          <Button
                            size="sm"
                            disabled={!affordable || isUpgrading}
                            onClick={() => handleUpgrade(module.id)}
                            className={`
                              h-8 px-4 font-robotic text-xs tracking-wider transition-all duration-500
                              ${affordable 
                                ? 'bg-pearl/20 border border-pearl/50 text-pearl hover:bg-pearl/30 hover:shadow-[0_0_15px_hsl(var(--pearl)/0.3)]' 
                                : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'}
                            `}
                          >
                            {isUpgrading ? (
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 border-2 border-pearl border-t-transparent rounded-full animate-spin" />
                                <span>UPGRADING</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Circle className="h-3 w-3 fill-current drop-shadow-[0_0_4px_hsl(var(--pearl)/0.6)]" />
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
            className="w-full bg-transparent border border-primary/30 text-primary/80 font-robotic uppercase tracking-widest h-11 transition-all duration-500 hover:bg-primary/10 hover:border-primary/50"
          >
            CLOSE BAY
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EngineeringBayModal;