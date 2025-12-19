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
      <AlertDialogContent className="border-[hsl(var(--hud-emergency))] bg-background/95 backdrop-blur-sm max-w-sm">
        {/* Emergency glow effect */}
        <div className="absolute inset-0 rounded-lg animate-pulse opacity-20 bg-[hsl(var(--hud-emergency))]" />
        
        <AlertDialogHeader className="relative">
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
            <p className="text-muted-foreground text-sm">
              You left the focus zone too many times. Session aborted.
            </p>
            <div className="pt-2 border-t border-[hsl(var(--hud-emergency)/0.3)]">
              <p className="text-[hsl(var(--hud-emergency))] font-robotic text-xs uppercase tracking-widest">
                ⚠ Loot Lost
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="relative">
          <AlertDialogAction 
            onClick={onClose}
            className="w-full font-robotic uppercase tracking-wider bg-[hsl(var(--hud-emergency))] hover:bg-[hsl(var(--hud-emergency)/0.8)] text-white"
          >
            Surface
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmergencyModal;
