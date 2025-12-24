import { useState } from "react";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginViewProps {
  onLogin: () => void;
}

// Generate random bubble positions
const generateBubbles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    size: 2 + Math.random() * 6,
  }));
};

const bubbles = generateBubbles(20);

export const LoginView = ({ onLogin }: LoginViewProps) => {
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = () => {
    setIsInitializing(true);
    // Simulate brief initialization
    setTimeout(() => {
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Rising bubbles animation */}
      <div className="absolute inset-0 pointer-events-none">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-hud-cyan/20 animate-bubble"
            style={{
              left: `${bubble.left}%`,
              bottom: "-20px",
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Radar sweep effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full border border-hud-cyan/10 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute w-60 h-60 rounded-full border border-hud-cyan/15 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute w-40 h-40 rounded-full border border-hud-cyan/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className={`relative z-10 flex flex-col items-center gap-8 transition-opacity duration-500 ${isInitializing ? 'opacity-0' : 'opacity-100'}`}>
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-hud-cyan/30 blur-3xl rounded-full scale-150" />
          <div className="relative p-6 rounded-full border-2 border-hud-cyan/50 bg-black/50">
            <div className="relative z-10 animate-float w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-full drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse-slow"></div>
            <Anchor className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.8)]" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <h1 
            className="text-6xl md:text-7xl font-robotic font-bold tracking-[0.3em] text-hud-cyan"
            style={{ 
              textShadow: '0 0 30px hsl(var(--hud-cyan)), 0 0 60px hsl(var(--hud-cyan) / 0.5)' 
            }}
          >
            DEEP DIVE
          </h1>
          
          {/* Blinking subtitle */}
          <p className="font-robotic text-sm tracking-widest text-hud-cyan/70 animate-pulse">
            SYSTEM READY // WAITING FOR PILOT
          </p>
        </div>

        {/* Initialize button */}
        <Button
          onClick={handleInitialize}
          variant="outline"
          disabled={isInitializing}
          className="mt-8 px-12 py-6 h-auto bg-transparent border-2 border-cyan-500 text-cyan-400 font-robotic uppercase tracking-[0.2em] text-lg transition-all duration-300 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] disabled:opacity-50"
        >
          {isInitializing ? "INITIALIZING..." : "INITIALIZE DIVE"}
        </Button>

        {/* Version/status text */}
        <p className="font-robotic text-xs tracking-wider text-muted-foreground/50 mt-8">
          v1.0.0 // DIVE SYSTEMS ONLINE
        </p>
      </div>
    </div>
  );
};

export default LoginView;
