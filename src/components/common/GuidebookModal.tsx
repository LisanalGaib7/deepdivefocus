import { BookOpen } from "lucide-react";
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

      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-widest text-center text-primary font-mono">
            📖 GUIDEBOOK
          </DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full space-y-2">
          <AccordionItem 
            value="oxygen" 
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              🤿 OXYGEN SYSTEMS
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
                Focus is your oxygen. Keep the timer running to dive deeper.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
                If you pause or stop early, you ascend immediately.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
                Longer focus sessions reach greater depths.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="collection" 
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              🦑 BIO-SCANNING
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
                Discover marine lifeforms by completing focus sessions.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
                The deeper you dive, the higher the chance to find RARE creatures.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
                Check your collection in the 'Collection' tab.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem 
            value="customization" 
            className="border border-primary/20 rounded-lg px-4 bg-card/50 backdrop-blur-sm"
          >
            <AccordionTrigger className="text-primary hover:no-underline font-mono tracking-wide">
              🎨 SYSTEM CUSTOMIZATION
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
                Customize your interface colors directly on the Main Dashboard.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">▸</span>
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
