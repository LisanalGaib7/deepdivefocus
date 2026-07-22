import { Maximize, Minimize, Volume2, VolumeX, Wrench, BookOpen, Power, LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import GuidebookModal from "@/components/common/GuidebookModal";

interface TopBarSheetProps {
  trigger: React.ReactNode;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenEngineeringBay: () => void;
  onLogout: () => void;
}

interface RowProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onClick: () => void;
  destructive?: boolean;
}

const Row = ({ icon: Icon, label, hint, onClick, destructive }: RowProps) => (
  <button
    onClick={onClick}
    className={`w-full min-h-14 flex items-center gap-4 px-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors ${
      destructive ? "text-destructive hover:text-destructive" : "text-foreground"
    }`}
  >
    <Icon className="w-5 h-5 shrink-0" />
    <div className="flex-1 text-left">
      <div className="text-sm font-robotic tracking-widest uppercase font-bold">{label}</div>
      {hint && <div className="text-[11px] font-mono text-muted-foreground normal-case tracking-normal">{hint}</div>}
    </div>
  </button>
);

const TopBarSheet = ({
  trigger,
  isFullscreen,
  onToggleFullscreen,
  isSoundEnabled,
  onToggleSound,
  onOpenEngineeringBay,
  onLogout,
}: TopBarSheetProps) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl border-t border-primary/30 pb-safe">
        <SheetHeader>
          <SheetTitle className="text-primary font-robotic tracking-[0.25em] uppercase text-sm text-left">
            Command Menu
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          <Row
            icon={isFullscreen ? Minimize : Maximize}
            label={isFullscreen ? "Exit Immersion" : "Full Immersion"}
            hint="Fullscreen view"
            onClick={() => {
              onToggleFullscreen();
              close();
            }}
          />
          <Row
            icon={isSoundEnabled ? Volume2 : VolumeX}
            label={isSoundEnabled ? "Silent Running" : "Sonar Active"}
            hint={isSoundEnabled ? "Mute notifications" : "Enable notifications"}
            onClick={() => {
              onToggleSound();
              close();
            }}
          />
          <Row
            icon={Wrench}
            label="Engineering Bay"
            hint="Vessel upgrades"
            onClick={() => {
              onOpenEngineeringBay();
              close();
            }}
          />

          {/* Guidebook — reuses the existing modal trigger inside the sheet */}
          <div onClick={close}>
            <GuidebookModal
              trigger={
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full min-h-14 flex items-center gap-4 px-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-foreground cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-robotic tracking-widest uppercase font-bold">Guidebook</div>
                    <div className="text-[11px] font-mono text-muted-foreground normal-case tracking-normal">
                      Systems reference
                    </div>
                  </div>
                </div>
              }
            />
          </div>

          <Row
            icon={Power}
            label="Log Out"
            hint="Sign out of the vessel"
            destructive
            onClick={() => {
              close();
              onLogout();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TopBarSheet;
