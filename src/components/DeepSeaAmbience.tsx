import { useEffect, useState, useMemo } from "react";

interface Bubble {
  id: number;
  left: number; // percentage
  size: number; // pixels
  opacity: number;
  duration: number; // seconds
  delay: number; // seconds
}

interface DeepSeaAmbienceProps {
  isActive: boolean;
  isDiving?: boolean; // initial burst when dive starts
}

const DeepSeaAmbience = ({ isActive, isDiving = false }: DeepSeaAmbienceProps) => {
  const [showBubbles, setShowBubbles] = useState(false);

  // Generate random bubbles
  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90, // 5-95%
      size: 3 + Math.random() * 6, // 3-9px
      opacity: 0.08 + Math.random() * 0.15, // 0.08-0.23
      duration: 12 + Math.random() * 18, // 12-30s (very slow)
      delay: Math.random() * 8, // 0-8s stagger
    }));
  }, []);

  // Delay bubble appearance for smooth transition
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowBubbles(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowBubbles(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep sea radial gradient backdrop */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          showBubbles ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 80%, 
              hsl(var(--primary) / 0.08) 0%, 
              transparent 60%
            ),
            radial-gradient(circle at 50% 100%, 
              hsl(200 80% 10% / 0.3) 0%, 
              transparent 50%
            )
          `,
        }}
      />

      {/* Dive burst effect */}
      {isDiving && (
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(circle at 50% 50%, 
              hsl(var(--primary) / 0.1) 0%, 
              transparent 70%
            )`,
            animationDuration: "0.5s",
            animationIterationCount: "2",
          }}
        />
      )}

      {/* Rising bubbles */}
      {showBubbles && bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full animate-bubble"
          style={{
            left: `${bubble.left}%`,
            bottom: `-${bubble.size * 2}px`,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: `hsl(var(--primary) / ${bubble.opacity})`,
            boxShadow: `0 0 ${bubble.size}px hsl(var(--primary) / ${bubble.opacity * 0.5})`,
            animationDuration: isDiving ? `${bubble.duration * 0.3}s` : `${bubble.duration}s`,
            animationDelay: isDiving ? "0s" : `${bubble.delay}s`,
            animationFillMode: "both",
          }}
        />
      ))}

      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, 
            transparent 40%, 
            hsl(0 0% 0% / 0.4) 100%
          )`,
        }}
      />
    </div>
  );
};

export default DeepSeaAmbience;
