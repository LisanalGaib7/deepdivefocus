// FLAG: SUBSCRIPTION_ENABLED — gated, DO NOT DELETE.
// See src/features/monetization/README.md for the reactivation checklist.
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Atom, Check, Crown, Gauge, BarChart3, Layers, Shield, Sparkles, Infinity } from "lucide-react";

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
  { icon: BarChart3, label: "Full Analytics Suite", highlight: true },
  { icon: Crown, label: "Pro Prestige Badge", highlight: true },
  { icon: Atom, label: "Vessel Classes 3-5+", highlight: true },
];

type PlanType = 'monthly' | 'yearly' | 'lifetime';

const PLAN_CONFIG: Record<PlanType, { label: string; cta: string; subtext: string }> = {
  monthly: { label: 'Monthly', cta: 'START MONTHLY PLAN', subtext: 'Cancel anytime · No commitment' },
  yearly: { label: 'Yearly', cta: 'START YEARLY PLAN', subtext: 'Save 60% vs monthly billing' },
  lifetime: { label: 'Lifetime', cta: 'START ETERNAL DIVE', subtext: 'One payment. Unlimited access. Forever.' },
};

export const PricingModal = ({ open, onClose, isPro, onActivatePro }: PricingModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-slate-950/95 border-primary/30 max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-3xl">
        {/* Blueprint grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04] rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* CRT Scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-[1]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.08) 2px,
              rgba(0,0,0,0.08) 4px
            )`,
          }}
        />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-[2]"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)`,
          }}
        />

        <div className="relative p-6 space-y-6 z-[3]">
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
              className="text-2xl font-extrabold tracking-[0.3em] font-robotic text-primary uppercase"
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

          {/* Benefits cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Standard / Free */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div>
                <p className="text-[10px] text-white/70 font-mono tracking-widest uppercase mb-1 font-semibold">Standard</p>
                <p className="text-xl font-extrabold font-robotic text-white/70 tracking-wider">FREE</p>
              </div>
              <div className="h-px bg-white/10" />
              <ul className="space-y-2.5">
                {FREE_FEATURES.map(({ label }) => (
                  <li key={label} className="flex items-start gap-2">
                    <Check className="h-3 w-3 text-white/60 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-white/70 font-mono leading-tight">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deep Dive Pro — golden energy frame with glassmorphism */}
            <div
              className="relative rounded-2xl p-5 space-y-3"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(10,8,0,0.9) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '2px solid rgba(234,179,8,0.85)',
                boxShadow: '0 0 8px rgba(234,179,8,0.7), 0 0 20px rgba(234,179,8,0.5), 0 0 40px rgba(234,179,8,0.25), inset 0 0 20px rgba(234,179,8,0.08)',
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/15 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-500/10 rounded-full blur-2xl" />
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Crown className="h-3 w-3 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.9)]" />
                  <p className="text-[10px] text-yellow-400 font-mono tracking-widest uppercase font-semibold">Deep Dive Pro</p>
                </div>
                <p className="text-xl font-extrabold font-robotic text-yellow-400 tracking-wider drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                  PRO
                </p>
              </div>
              <div className="h-px bg-yellow-500/30" />
              <ul className="space-y-2.5">
                {PRO_FEATURES.map(({ label, highlight }) => (
                  <li key={label} className="flex items-start gap-2">
                    <Check className={`h-3 w-3 mt-0.5 shrink-0 ${highlight ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]' : 'text-white/40'}`} />
                    <span className={`text-[11px] font-mono leading-tight ${highlight ? 'text-yellow-300 font-bold' : 'text-white/70'}`}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Plan Selection */}
          <div className="space-y-5">
            <p className="text-[10px] text-white/70 font-mono tracking-[0.4em] uppercase font-semibold text-center">
              Choose Your Reactor
            </p>

            <div className="flex flex-col gap-4 mt-4">
              {/* Monthly */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-300 ${
                  selectedPlan === 'monthly' ? 'ring-2 ring-white/30' : ''
                }`}
                style={{
                  background: selectedPlan === 'monthly' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${selectedPlan === 'monthly' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: selectedPlan === 'monthly'
                    ? '0 4px 20px rgba(255,255,255,0.04), 0 0 1px rgba(255,255,255,0.1)'
                    : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === 'monthly' ? 'border-white/60' : 'border-white/20'}`}>
                    {selectedPlan === 'monthly' && <div className="w-2 h-2 rounded-full bg-white/80" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/70 font-mono tracking-wider uppercase font-bold">Monthly</p>
                    <p className="text-[10px] text-white/60 font-mono mt-0.5">Cancel anytime</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-robotic font-black text-white/80 leading-none">
                    <span className="text-sm opacity-60">$</span>
                    <span className="text-2xl">2.99</span>
                  </p>
                  <p className="text-[9px] font-mono text-white/60 mt-0.5">/month</p>
                </div>
              </button>

              {/* Yearly */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`relative rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-300 ${
                  selectedPlan === 'yearly' ? 'ring-2 ring-yellow-500/50' : ''
                }`}
                style={{
                  background: selectedPlan === 'yearly'
                    ? 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(10,8,0,0.92))'
                    : 'linear-gradient(135deg, rgba(234,179,8,0.04), rgba(10,8,0,0.95))',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1.5px solid ${selectedPlan === 'yearly' ? 'rgba(234,179,8,0.7)' : 'rgba(234,179,8,0.15)'}`,
                  boxShadow: selectedPlan === 'yearly'
                    ? '0 8px 30px rgba(234,179,8,0.25), 0 0 10px rgba(234,179,8,0.35), inset 0 0 10px rgba(234,179,8,0.05)'
                    : '0 0 4px rgba(234,179,8,0.08)',
                }}
              >
                {/* Badge */}
                <span
                  className="absolute -top-3 right-4 z-10 text-[9px] font-extrabold tracking-widest px-3 py-1 rounded-full text-white font-mono uppercase whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.9), rgba(202,138,4,0.95))',
                    border: '1px solid rgba(234,179,8,0.8)',
                    boxShadow: '0 0 12px rgba(234,179,8,0.6), 0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  60% OFF
                </span>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === 'yearly' ? 'border-yellow-400/70' : 'border-yellow-500/25'}`}>
                    {selectedPlan === 'yearly' && <div className="w-2 h-2 rounded-full bg-yellow-400/90" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-yellow-400/90 font-mono tracking-wider uppercase font-bold">Yearly</p>
                    <p className="text-[10px] text-yellow-400/70 font-mono mt-0.5">$1.67/mo · billed annually</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-robotic font-black text-yellow-400 leading-none">
                    <span className="text-sm opacity-60">$</span>
                    <span className="text-2xl">19.99</span>
                  </p>
                  <p className="text-[9px] font-mono text-yellow-400/70 mt-0.5">/year</p>
                </div>
              </button>

              {/* Lifetime — The Eternal Core with breathing glow */}
              <button
                onClick={() => setSelectedPlan('lifetime')}
                className={`relative rounded-xl px-5 py-5 flex items-center justify-between transition-all duration-300 ${
                  selectedPlan === 'lifetime' ? 'ring-2 ring-amber-400/60' : ''
                }`}
                style={{
                  background: selectedPlan === 'lifetime'
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.14), rgba(234,179,8,0.06), rgba(10,8,0,0.92))'
                    : 'linear-gradient(135deg, rgba(251,191,36,0.04), rgba(10,8,0,0.95))',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `1.5px solid ${selectedPlan === 'lifetime' ? 'rgba(251,191,36,0.75)' : 'rgba(251,191,36,0.12)'}`,
                  boxShadow: selectedPlan === 'lifetime'
                    ? '0 8px 35px rgba(251,191,36,0.3), 0 0 12px rgba(251,191,36,0.45), 0 0 50px rgba(251,191,36,0.12), inset 0 0 12px rgba(251,191,36,0.06)'
                    : 'none',
                  animation: selectedPlan === 'lifetime' ? 'lifetime-breathe 3s ease-in-out infinite' : 'none',
                }}
              >
                {/* Badge */}
                <span
                  className="absolute -top-3 right-4 z-10 text-[9px] font-extrabold tracking-widest px-3 py-1 rounded-full text-white font-mono uppercase whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.9), rgba(245,158,11,0.95))',
                    border: '1px solid rgba(251,191,36,0.8)',
                    boxShadow: '0 0 14px rgba(251,191,36,0.7), 0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  MOST POPULAR
                </span>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === 'lifetime' ? 'border-amber-400/70' : 'border-amber-500/20'}`}>
                    {selectedPlan === 'lifetime' && <div className="w-2 h-2 rounded-full bg-amber-400/90" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-amber-300/90 font-mono tracking-wider uppercase font-bold flex items-center gap-1.5">
                      Lifetime
                      <Infinity
                        className="h-4 w-4 text-amber-300"
                        style={{
                          filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.8)) drop-shadow(0 0 12px rgba(251,191,36,0.4))',
                        }}
                      />
                    </p>
                    <p className="text-[10px] text-amber-400/45 font-mono mt-0.5">The Eternal Core · No recurring fees</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-robotic font-black text-amber-300 leading-none" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}>
                    <span className="text-sm opacity-60">$</span>
                    <span className="text-[28px]">39.99</span>
                  </p>
                  <p className="text-[9px] font-mono text-amber-400/45 mt-0.5">one-time</p>
                </div>
              </button>
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
                <span className="font-robotic text-yellow-400 tracking-widest text-sm uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                  PRO ACTIVE
                </span>
              </div>
            ) : (
              <Button
                onClick={onActivatePro}
                className="w-full h-14 font-robotic tracking-widest text-base uppercase rounded-2xl border-2 border-yellow-500/80 text-yellow-300 hover:text-yellow-200 transition-all duration-300"
                style={{
                  background: selectedPlan === 'lifetime'
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.35), rgba(234,179,8,0.15))'
                    : 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(234,179,8,0.12))',
                  boxShadow: selectedPlan === 'lifetime'
                    ? '0 0 25px rgba(251,191,36,0.6), 0 0 50px rgba(251,191,36,0.35), 0 0 80px rgba(234,179,8,0.2), inset 0 1px 0 rgba(251,191,36,0.3)'
                    : '0 0 25px rgba(234,179,8,0.5), 0 0 50px rgba(234,179,8,0.3), 0 0 80px rgba(234,179,8,0.15), inset 0 1px 0 rgba(234,179,8,0.25)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 35px rgba(234,179,8,0.6), 0 0 70px rgba(234,179,8,0.4), 0 0 100px rgba(234,179,8,0.2), inset 0 1px 0 rgba(234,179,8,0.35)';
                }}
                onMouseLeave={(e) => {
                  const base = selectedPlan === 'lifetime'
                    ? '0 0 25px rgba(251,191,36,0.6), 0 0 50px rgba(251,191,36,0.35), 0 0 80px rgba(234,179,8,0.2), inset 0 1px 0 rgba(251,191,36,0.3)'
                    : '0 0 25px rgba(234,179,8,0.5), 0 0 50px rgba(234,179,8,0.3), 0 0 80px rgba(234,179,8,0.15), inset 0 1px 0 rgba(234,179,8,0.25)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = base;
                }}
              >
                <Sparkles className="h-4 w-4 mr-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.9)]" />
                {PLAN_CONFIG[selectedPlan].cta}
              </Button>
            )}

            <p className="text-center text-[11px] text-white/40 font-mono tracking-wide">
              {isPro ? 'ALL VESSEL CAPABILITIES UNLOCKED' : PLAN_CONFIG[selectedPlan].subtext}
            </p>
            {!isPro && (
              <p className="text-center text-[9px] text-white/25 font-mono tracking-wide mt-1">
                Join 10,000+ divers in the deep sea at a fraction of the cost
              </p>
            )}
          </div>

          {/* Return to Surface */}
          <div className="pt-4 pb-2 flex justify-center">
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-12 font-mono text-sm font-semibold text-white/70 hover:text-white/70 hover:bg-white/[0.06] tracking-widest border border-white/15 rounded-xl transition-all duration-200"
            >
              RETURN TO SURFACE
            </Button>
          </div>
        </div>

        {/* Breathing glow keyframes */}
        <style>{`
          @keyframes lifetime-breathe {
            0%, 100% {
              box-shadow: 0 8px 35px rgba(251,191,36,0.3), 0 0 12px rgba(251,191,36,0.45), 0 0 50px rgba(251,191,36,0.12), inset 0 0 12px rgba(251,191,36,0.06);
            }
            50% {
              box-shadow: 0 8px 45px rgba(251,191,36,0.45), 0 0 18px rgba(251,191,36,0.6), 0 0 70px rgba(251,191,36,0.2), inset 0 0 18px rgba(251,191,36,0.1);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
