import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Atom, Check, Crown, Gauge, BarChart3, Layers, Shield, Sparkles, Diamond, Infinity } from "lucide-react";

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
              className="text-2xl font-extrabold tracking-[0.3em] font-orbitron text-primary uppercase"
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase mb-1 font-semibold">Standard</p>
                <p className="text-xl font-extrabold font-orbitron text-white/70 tracking-wider">FREE</p>
              </div>
              <div className="h-px bg-white/10" />
              <ul className="space-y-2.5">
                {FREE_FEATURES.map(({ label }) => (
                  <li key={label} className="flex items-start gap-2">
                    <Check className="h-3 w-3 text-white/35 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-white/50 font-mono leading-tight">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deep Dive Pro — golden energy frame */}
            <div
              className="relative rounded-2xl p-5 space-y-3"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.1) 0%, rgba(10,8,0,0.95) 100%)',
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
                <p className="text-xl font-extrabold font-orbitron text-yellow-400 tracking-wider drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                  PRO
                </p>
              </div>
              <div className="h-px bg-yellow-500/30" />
              <ul className="space-y-2.5">
                {PRO_FEATURES.map(({ label, highlight }) => (
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

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Plan Selection - 3 Cards */}
          <div className="space-y-5">
            <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase font-semibold text-center">
              Choose Your Reactor
            </p>

            <div className="flex flex-col gap-3 mt-4">
              {/* Monthly */}
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`relative rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-300 ${
                  selectedPlan === 'monthly' ? 'ring-2 ring-white/30' : ''
                }`}
                style={{
                  background: selectedPlan === 'monthly' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedPlan === 'monthly' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: selectedPlan === 'monthly' ? '0 0 15px rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === 'monthly' ? 'border-white/60' : 'border-white/20'}`}>
                    {selectedPlan === 'monthly' && <div className="w-2 h-2 rounded-full bg-white/80" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/70 font-mono tracking-wider uppercase font-semibold">Monthly</p>
                    <p className="text-[10px] text-white/35 font-mono mt-0.5">Cancel anytime</p>
                  </div>
                </div>
                <p className="text-xl font-extrabold font-orbitron text-white/70">$2.99<span className="text-[10px] font-mono font-normal text-white/40 ml-1">/mo</span></p>
              </button>

              {/* Yearly — Most Popular */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`relative rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-300 ${
                  selectedPlan === 'yearly' ? 'ring-2 ring-yellow-500/50' : ''
                }`}
                style={{
                  background: selectedPlan === 'yearly'
                    ? 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(10,8,0,0.95))'
                    : 'linear-gradient(135deg, rgba(234,179,8,0.04), rgba(10,8,0,0.95))',
                  border: `1.5px solid ${selectedPlan === 'yearly' ? 'rgba(234,179,8,0.7)' : 'rgba(234,179,8,0.2)'}`,
                  boxShadow: selectedPlan === 'yearly'
                    ? '0 0 12px rgba(234,179,8,0.6), 0 0 30px rgba(234,179,8,0.35), 0 0 50px rgba(234,179,8,0.15), inset 0 0 15px rgba(234,179,8,0.08)'
                    : '0 0 6px rgba(234,179,8,0.15)',
                }}
              >
                {/* Badge */}
                <span
                  className="absolute -top-2.5 right-4 text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-yellow-500/25 text-yellow-400 border border-yellow-500/50 font-mono uppercase whitespace-nowrap"
                  style={{ boxShadow: '0 0 12px rgba(234,179,8,0.5)' }}
                >
                  BEST VALUE · 60% OFF
                </span>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === 'yearly' ? 'border-yellow-400/70' : 'border-yellow-500/25'}`}>
                    {selectedPlan === 'yearly' && <div className="w-2 h-2 rounded-full bg-yellow-400/90" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-yellow-400/90 font-mono tracking-wider uppercase font-semibold">Yearly</p>
                    <p className="text-[10px] text-yellow-400/40 font-mono mt-0.5">$1.67/mo · billed annually</p>
                  </div>
                </div>
                <p className="text-xl font-extrabold font-orbitron text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]">$19.99<span className="text-[10px] font-mono font-normal text-yellow-400/45 ml-1">/yr</span></p>
              </button>

              {/* Lifetime — The Eternal Core */}
              <button
                onClick={() => setSelectedPlan('lifetime')}
                className={`relative rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-300 ${
                  selectedPlan === 'lifetime' ? 'ring-2 ring-amber-400/60' : ''
                }`}
                style={{
                  background: selectedPlan === 'lifetime'
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.14), rgba(234,179,8,0.06), rgba(10,8,0,0.95))'
                    : 'linear-gradient(135deg, rgba(251,191,36,0.04), rgba(10,8,0,0.95))',
                  border: `1.5px solid ${selectedPlan === 'lifetime' ? 'rgba(251,191,36,0.75)' : 'rgba(251,191,36,0.15)'}`,
                  boxShadow: selectedPlan === 'lifetime'
                    ? '0 0 10px rgba(251,191,36,0.5), 0 0 25px rgba(251,191,36,0.25), inset 0 0 12px rgba(251,191,36,0.06)'
                    : 'none',
                }}
              >
                {/* Badge */}
                <span
                  className="absolute -top-2.5 right-4 text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/50 font-mono uppercase whitespace-nowrap"
                  style={{ boxShadow: '0 0 10px rgba(251,191,36,0.5)' }}
                >
                  LIMITED OFFER
                </span>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === 'lifetime' ? 'border-amber-400/70' : 'border-amber-500/20'}`}>
                    {selectedPlan === 'lifetime' && <div className="w-2 h-2 rounded-full bg-amber-400/90" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-amber-300/90 font-mono tracking-wider uppercase font-semibold flex items-center gap-1.5">
                      The Eternal Core <Diamond className="h-3 w-3 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
                    </p>
                    <p className="text-[10px] text-amber-400/40 font-mono mt-0.5">No recurring fees. Ever.</p>
                  </div>
                </div>
                <p className="text-xl font-extrabold font-orbitron text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">$39.99</p>
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
                <span className="font-orbitron text-yellow-400 tracking-widest text-sm uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                  PRO ACTIVE
                </span>
              </div>
            ) : (
              <Button
                onClick={onActivatePro}
                className="w-full h-14 font-orbitron tracking-widest text-base uppercase rounded-2xl border-2 border-yellow-500/80 text-yellow-300 hover:text-yellow-200 transition-all duration-300"
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
          <div className="pt-4 pb-2">
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-12 font-mono text-sm font-semibold text-white/50 hover:text-white/70 hover:bg-white/[0.08] tracking-widest border border-white/15 rounded-xl transition-all duration-200"
            >
              RETURN TO SURFACE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
