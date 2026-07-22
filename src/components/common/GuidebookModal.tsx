import { ReactNode } from "react";
import { BookOpen, Droplets, Fish, Palette, Wrench, Shield, Zap, Coins, Ship } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GuidebookModalProps {
  /** Custom trigger element. When omitted, renders the default topbar icon button. */
  trigger?: ReactNode;
}

const DefaultTrigger = (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
        aria-label="Guidebook"
      >
        <BookOpen className="w-5 h-5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
      GUIDEBOOK
    </TooltipContent>
  </Tooltip>
);

const GuidebookModal = ({ trigger }: GuidebookModalProps = {}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger ?? DefaultTrigger}</DialogTrigger>


      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/30 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-widest text-center text-primary font-mono flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6" />
            GUIDEBOOK
          </DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {/* OXYGEN SYSTEMS */}
          <AccordionItem
            value="oxygen"
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              <span className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary shrink-0" />
                OXYGEN SYSTEMS
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                Focus is your oxygen. Keep the timer running to dive deeper.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                If you pause or stop early, you ascend immediately.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                Longer focus sessions reach greater depths.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* BIO-SCANNING */}
          <AccordionItem
            value="collection"
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              <span className="flex items-center gap-2">
                <Fish className="w-5 h-5 text-primary shrink-0" />
                COLLECTION
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                Discover marine lifeforms by completing focus sessions.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                The deeper you dive, the higher the chance to find RARE creatures.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                Check your collection in the 'Collection' tab.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* ENGINEERING BAY */}
          <AccordionItem
            value="engineering"
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              <span className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary shrink-0" />
                ENGINEERING BAY
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {/* Upgrade Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Hull Reinforcement Card */}
                <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-primary/5 p-3.5 flex flex-col gap-2.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/15 border border-primary/30 shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] tracking-widest text-primary font-bold leading-tight">HULL</p>
                    <p className="font-mono text-[11px] tracking-widest text-primary font-bold leading-tight">REINFORCEMENT</p>
                  </div>
                  <p className="text-[12px] text-foreground/70 leading-relaxed">
                    Increases <span className="text-primary font-bold">Max Dive Depth</span>, unlocking deeper ocean layers.
                  </p>
                </div>

                {/* Ion Thruster Card */}
                <div className="relative overflow-hidden rounded-lg border border-pearl/30 bg-pearl/5 p-3.5 flex flex-col gap-2.5">
                  <div className="absolute inset-0 bg-gradient-to-br from-pearl/10 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-pearl/15 border border-pearl/30 shrink-0">
                    <Zap className="w-5 h-5 text-pearl" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] tracking-widest text-pearl font-bold leading-tight">ION</p>
                    <p className="font-mono text-[11px] tracking-widest text-pearl font-bold leading-tight">THRUSTER</p>
                  </div>
                  <p className="text-[12px] text-foreground/70 leading-relaxed">
                    Boosts <span className="text-pearl font-bold">Dive Speed</span> multiplier for faster descent.
                  </p>
                </div>
              </div>

              {/* Economy & Progression Info */}
              <div className="rounded-lg border border-primary/15 bg-background/60 p-3.5 space-y-3">
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-2">— GENERAL INFO —</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-pearl/15 border border-pearl/25 shrink-0">
                    <Coins className="w-4 h-4 text-pearl" />
                  </div>
                  <p className="text-[13px] text-foreground/70 leading-relaxed">
                    Upgrades cost <span className="text-pearl font-bold">Pearls</span> earned from completed dive sessions.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/15 border border-primary/25 shrink-0">
                    <Ship className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[13px] text-foreground/70 leading-relaxed">
                    Upgrade tiers evolve your <span className="text-primary font-bold">Vessel Class</span>{" "}
                    <span className="font-mono text-[11px] tracking-wide text-primary font-medium">(VOYAGER-1 → VOYAGER-5)</span>.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SYSTEM CUSTOMIZATION */}
          <AccordionItem
            value="customization"
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              <span className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary shrink-0" />
                SYSTEM CUSTOMIZATION
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                Customize your interface colors directly on the Main Dashboard.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                Track your daily progress in the 'History' tab.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};

export default GuidebookModal;
