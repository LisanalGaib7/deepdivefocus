import { BookOpen, Wind, Scan, Palette, Wrench } from "lucide-react";
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

const GuidebookModal = () => {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300"
              aria-label="Guidebook"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
          GUIDEBOOK
        </TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.2)] max-h-[80vh] overflow-y-auto">
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
                <Wind className="w-[18px] h-[18px] text-primary shrink-0" />
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
                <Scan className="w-[18px] h-[18px] text-primary shrink-0" />
                BIO-SCANNING
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
                <Wrench className="w-[18px] h-[18px] text-primary shrink-0" />
                ENGINEERING BAY
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                <span><span className="text-primary font-semibold">Hull Reinforcement</span> — Increases your submarine's Maximum Dive Depth, unlocking access to greater ocean layers.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                <span><span className="text-primary font-semibold">Ion Thruster</span> — Boosts your Dive Speed multiplier, accelerating how fast your depth increases per second of focus.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                All upgrades are purchased using <span className="text-primary font-semibold mx-1">Pearls</span> earned from completed dive sessions.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary shrink-0">▸</span>
                Reaching certain upgrade tiers automatically evolves your <span className="text-primary font-semibold mx-1">Vessel Class</span> — from VOYAGER-1 up to VOYAGER-5.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* SYSTEM CUSTOMIZATION */}
          <AccordionItem
            value="customization"
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              <span className="flex items-center gap-2">
                <Palette className="w-[18px] h-[18px] text-primary shrink-0" />
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
