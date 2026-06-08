// FLAG: SUBSCRIPTION_ENABLED — gated, DO NOT DELETE.
// See src/features/monetization/README.md for the reactivation checklist.
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Atom, Zap } from "lucide-react";

interface UpgradeRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onOpenPricing: () => void;
}

export const UpgradeRequiredModal = ({ open, onClose, onOpenPricing }: UpgradeRequiredModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-black/95 border-yellow-500/40 max-w-sm p-0 overflow-hidden rounded-3xl">
        {/* Blueprint grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(to right, #eab308 1px, transparent 1px), linear-gradient(to bottom, #eab308 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative p-6 space-y-5">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl scale-150" />
              <div className="relative bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-4">
                <Atom className="h-10 w-10 text-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h2
              className="text-lg font-bold tracking-[0.2em] text-yellow-400 font-orbitron uppercase"
              style={{ textShadow: '0 0 20px rgba(234,179,8,0.6)' }}
            >
              REACTOR LIMIT REACHED
            </h2>
            <p className="text-sm text-white/60 leading-relaxed font-mono">
              Focus is the key to the Deep Sea. Your current Vessel Reactor only supports{" "}
              <span className="text-white/90 font-bold">2 priority missions</span>. Upgrade to{" "}
              <span className="text-yellow-400 font-bold">Nuclear Reactor</span> for Unlimited Slots.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={() => { onClose(); onOpenPricing(); }}
              className="w-full h-12 font-orbitron tracking-widest text-sm uppercase bg-yellow-500/20 border border-yellow-500/60 text-yellow-400 hover:bg-yellow-500/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-300"
            >
              <Zap className="h-4 w-4 mr-2" />
              UPGRADE REACTOR
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-10 font-mono tracking-wider text-xs text-white/30 hover:text-white/50"
            >
              REMAIN AT STANDARD TIER
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
