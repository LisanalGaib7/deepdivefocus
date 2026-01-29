import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface EmergencyModalProps {
  open: boolean;
  onClose: () => void;
  depth: number;
}

export const EmergencyModal = ({ open, onClose, depth }: EmergencyModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {/*
        IMPORTANT: Keep AlertDialogContent as an unstyled wrapper.
        All visual styles (rounded, border, shadow, clipping) must live on ONE element
        to prevent square glow artifacts on larger screens.
      */}
      <AlertDialogContent className="max-w-sm border-0 bg-transparent shadow-none p-0">
        <div className="relative overflow-hidden rounded-3xl border border-[hsl(var(--hud-emergency)/0.4)] bg-background/95 backdrop-blur-md shadow-[0_28px_90px_-28px_hsl(var(--hud-emergency)/0.35)]">
          {/* Emergency glow effect (clipped by the same rounded container) */}
          <div className="absolute inset-0 rounded-3xl animate-pulse opacity-20 bg-[hsl(var(--hud-emergency))]" />

          <div className="relative p-6">
            <AlertDialogHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-[hsl(var(--hud-emergency)/0.2)] border border-[hsl(var(--hud-emergency))]">
                  <AlertTriangle className="h-10 w-10 text-[hsl(var(--hud-emergency))] animate-pulse" />
                </div>
              </div>

              <AlertDialogTitle className="text-center font-robotic text-2xl tracking-wider text-[hsl(var(--hud-emergency))]">
                EMERGENCY ASCENT
              </AlertDialogTitle>

              <AlertDialogDescription className="text-center space-y-3 pt-2">
                <p className="font-robotic text-foreground uppercase tracking-wide">
                  Oxygen depleted at {depth}m
                </p>
                <p className="text-muted-foreground text-sm max-w-[80%] mx-auto">
                  Distractions detected.
                  <br />
                  Dive session aborted.
                </p>
                <div className="pt-2 border-t border-[hsl(var(--hud-emergency)/0.3)]">
                  <p className="text-[hsl(var(--hud-emergency))] font-robotic text-xs uppercase tracking-widest">
                    ⚠ REWARDS LOST
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6">
              <AlertDialogAction
                onClick={onClose}
                className="w-full font-robotic uppercase tracking-wider bg-[hsl(var(--hud-emergency))] hover:bg-[hsl(var(--hud-emergency)/0.8)] text-white"
              >
                Surface
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmergencyModal;
