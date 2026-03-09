import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Atom, Check, Circle, Crown, Gauge, BarChart3, Layers, Shield } from "lucide-react";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  isPro: boolean;
  onActivatePro: () => void;
  currentPearls?: number;
}

const FREE_FEATURES = [
  { icon: Layers, label: "2 Priority Mission Slots" },
  { icon: BarChart3, label: "Today & This Week Analytics" },
  { icon: Shield, label: "5 Standard Themes" },
  { icon: Gauge, label: "Vessel Classes 1-2" },
];

const PRO_FEATURES = [
  { icon: Layers, label: "Unlimited Mission Slots", highlight: true },
  { icon: BarChart3, label: "Monthly, Yearly & All-time Analytics", highlight: true },
  { icon: Crown, label: "Pro Prestige Badge", highlight: true },
  { icon: Atom, label: "Vessel Classes 3-5+", highlight: true },
];

export const PricingModal = ({ open, onClose, isPro, onActivatePro }: PricingModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950 border-primary/30 max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-3xl">
        {/* Blueprint grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl scale-150" />
                <div className="relative bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-3.5">
                  <Atom className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_16px_rgba(234,179,8,0.9)]" />
                </div>
              </div>
            </div>
            <h2
              className="text-2xl font-bold tracking-[0.25em] font-orbitron text-primary uppercase"
              style={{ textShadow: `0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary)/0.3)` }}
            >
              ENGINEERING BAY
            </h2>
            <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
              Vessel Upgrade Terminal
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Pricing cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Standard / Free */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase mb-1">Standard</p>
                <p className="text-xl font-bold font-orbitron text-white/70">FREE</p>
              </div>
              <div className="h-px bg-white/10" />
              <ul className="space-y-2">
                {FREE_FEATURES.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-2">
                    <Check className="h-3 w-3 text-white/30 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-white/40 font-mono leading-tight">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deep Dive Pro */}
            <div
              className="relative border rounded-2xl p-4 space-y-3 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(0,0,0,0.8) 100%)',
                borderColor: 'rgba(234,179,8,0.5)',
                boxShadow: '0 0 30px rgba(234,179,8,0.15), inset 0 1px 0 rgba(234,179,8,0.1)',
              }}
            >
              {/* Glow overlay */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-full blur-2xl" />

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Crown className="h-3 w-3 text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
                  <p className="text-[10px] text-yellow-400 font-mono tracking-widest uppercase">Deep Dive Pro</p>
                </div>
                <p className="text-xl font-bold font-orbitron text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                  PRO
                </p>
              </div>
              <div className="h-px bg-yellow-500/20" />
              <ul className="space-y-2">
                {PRO_FEATURES.map(({ icon: Icon, label, highlight }) => (
                  <li key={label} className="flex items-start gap-2">
                    <Check className={`h-3 w-3 mt-0.5 shrink-0 ${highlight ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]' : 'text-white/40'}`} />
                    <span className={`text-[11px] font-mono leading-tight ${highlight ? 'text-yellow-300 font-bold' : 'text-white/50'}`}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            {isPro ? (
              <div
                className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 border"
                style={{
                  background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(0,0,0,0.5))',
                  borderColor: 'rgba(234,179,8,0.5)',
                  boxShadow: '0 0 30px rgba(234,179,8,0.3)',
                }}
              >
                <Crown className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                <span className="font-orbitron text-yellow-400 tracking-widest text-sm uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                  PRO ACCESS ACTIVE
                </span>
              </div>
            ) : (
              <Button
                onClick={onActivatePro}
                className="w-full h-14 font-orbitron tracking-widest text-sm uppercase rounded-2xl border-2 border-yellow-500/70 text-yellow-400 hover:text-yellow-300 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(234,179,8,0.25), rgba(234,179,8,0.08))',
                  boxShadow: '0 0 30px rgba(234,179,8,0.35), inset 0 1px 0 rgba(234,179,8,0.2)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(234,179,8,0.5), inset 0 1px 0 rgba(234,179,8,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(234,179,8,0.35), inset 0 1px 0 rgba(234,179,8,0.2)';
                }}
              >
                <Atom className="h-4 w-4 mr-2 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
                UPGRADE NOW
              </Button>
            )}

            <p className="text-center text-[11px] text-white/40 font-mono tracking-wide">
              {isPro ? 'ALL VESSEL CAPABILITIES UNLOCKED' : "Enhance your vessel's capabilities"}
            </p>
          </div>

          {/* Comparison details */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Capability Comparison</p>
            <div className="space-y-3">
              {[
                { feature: "Mission Slots", free: "2", pro: "Unlimited" },
                { feature: "Analytics", free: "Today / Week", pro: "Full Journey" },
                { feature: "Vessel Classes", free: "1–2", pro: "3–5+ Elite" },
                { feature: "Prestige Badge", free: "—", pro: "◆ PRO" },
              ].map(({ feature, free, pro }) => (
                <div key={feature} className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 text-[11px] items-center">
                  <span className="text-white/40 font-mono text-left">{feature}</span>
                  <span className="text-center text-white/30 font-mono">{free}</span>
                  <span className="text-right text-yellow-400 font-mono font-bold drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]">{pro}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-white/5" />
            <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 text-[10px]">
              <span className="text-white/20 font-mono text-left">Tier</span>
              <span className="text-center text-white/20 font-mono">Standard</span>
              <span className="text-right text-yellow-500/60 font-mono">Pro</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
