import { useState } from "react";
import { CloudRain, Volume2, Waves, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

type SoundKey = "rain" | "ocean" | "whiteNoise";

interface AmbientSoundMixerProps {
  sounds: Record<SoundKey, boolean>;
  toggleSound: (key: SoundKey) => void;
  activeSoundsCount: number;
}

const SOUND_OPTIONS: { key: SoundKey; label: string; Icon: typeof CloudRain }[] = [
  { key: "rain", label: "Rain", Icon: CloudRain },
  { key: "ocean", label: "Ocean Waves", Icon: Waves },
  { key: "whiteNoise", label: "White Noise", Icon: Wind },
];

const AmbientSoundMixer = ({ sounds, toggleSound, activeSoundsCount }: AmbientSoundMixerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Button
          onClick={() => setOpen(prev => !prev)}
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Volume2 className={`h-5 w-5 ${activeSoundsCount > 0 ? "text-foreground" : ""}`} />
          <span className="text-sm font-semibold">
            Ambient Sounds {activeSoundsCount > 0 && `(${activeSoundsCount})`}
          </span>
        </Button>
      </div>

      {open && (
        <div className="flex justify-center gap-4 animate-fade-in">
          {SOUND_OPTIONS.map(({ key, label, Icon }) => (
            <Button
              key={key}
              onClick={() => toggleSound(key)}
              variant="ghost"
              className={`flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl transition-all duration-300 ${
                sounds[key]
                  ? "text-foreground bg-foreground/10"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmbientSoundMixer;
