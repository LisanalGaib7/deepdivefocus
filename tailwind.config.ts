import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        robotic: ['Orbitron', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          deep: "hsl(var(--primary-deep))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        pearl: {
          DEFAULT: "hsl(var(--pearl))",
          foreground: "hsl(var(--pearl-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))',
        'gradient-glow': 'linear-gradient(135deg, hsl(var(--gradient-start) / 0.2), hsl(var(--gradient-end) / 0.2))',
      },
      boxShadow: {
        'glow-blue': '0 0 40px hsl(var(--primary) / 0.4)',
        'glow-blue-intense': '0 0 60px hsl(var(--primary) / 0.6)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 20px hsl(199 89% 48% / 0.4))",
          },
          "50%": {
            filter: "drop-shadow(0 0 40px hsl(199 89% 48% / 0.6))",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "creature-swim": {
          "0%, 100%": { transform: "translateX(-2px) scaleX(1)" },
          "25%": { transform: "translateX(0px) scaleX(0.93)" },
          "50%": { transform: "translateX(2px) scaleX(1)" },
          "75%": { transform: "translateX(0px) scaleX(0.93)" },
        },
        "creature-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-6px)" },
          "60%": { transform: "translateY(-3px)" },
        },
        "creature-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
        "creature-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-4px) rotate(2deg)" },
          "75%": { transform: "translateY(3px) rotate(-2deg)" },
        },
        "creature-slither": {
          "0%, 100%": { transform: "translateX(0) skewX(0deg)" },
          "25%": { transform: "translateX(2px) skewX(3deg)" },
          "50%": { transform: "translateX(0) skewX(0deg)" },
          "75%": { transform: "translateX(-2px) skewX(-3deg)" },
        },
        "creature-glide": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-3px) rotate(-1deg)" },
        },
        "creature-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "40%": { transform: "scale(1.06)", opacity: "0.9" },
          "60%": { transform: "scale(0.96)", opacity: "0.8" },
        },
        "creature-wingflap": {
          "0%, 100%": { transform: "scaleY(1) translateY(0px)" },
          "30%": { transform: "scaleY(0.88) translateY(2px)" },
          "60%": { transform: "scaleY(1.04) translateY(-3px)" },
        },
        "creature-lure": {
          "0%, 100%": { filter: "drop-shadow(0 0 8px var(--tw-shadow-color, #00ffee)) brightness(1)" },
          "30%": { filter: "drop-shadow(0 0 20px var(--tw-shadow-color, #00ffee)) brightness(1.3)" },
          "50%": { filter: "drop-shadow(0 0 4px var(--tw-shadow-color, #00ffee)) brightness(0.9)" },
          "80%": { filter: "drop-shadow(0 0 16px var(--tw-shadow-color, #00ffee)) brightness(1.2)" },
        },
        "creature-shuffle": {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "15%": { transform: "translateX(1px) translateY(-0.5px)" },
          "30%": { transform: "translateX(-1px) translateY(0.5px)" },
          "45%": { transform: "translateX(1px) translateY(0px)" },
          "60%": { transform: "translateX(-1px) translateY(-0.5px)" },
          "75%": { transform: "translateX(0.5px) translateY(0.5px)" },
        },
        "creature-writhe": {
          "0%, 100%": { transform: "rotate(0deg) scaleX(1)" },
          "20%": { transform: "rotate(2deg) scaleX(0.95)" },
          "40%": { transform: "rotate(-3deg) scaleX(1.05)" },
          "60%": { transform: "rotate(2deg) scaleX(0.97)" },
          "80%": { transform: "rotate(-1deg) scaleX(1.03)" },
        },
        "creature-magma": {
          "0%, 100%": { transform: "translateX(0)", filter: "brightness(1)" },
          "30%": { transform: "translateX(1px)", filter: "brightness(1.4)" },
          "60%": { transform: "translateX(-1px)", filter: "brightness(0.9)" },
          "80%": { filter: "brightness(1.3)" },
        },
        "creature-ghost": {
          "0%, 100%": { transform: "translateX(0)", opacity: "0.7" },
          "15%": { opacity: "0.3" },
          "30%": { transform: "translateX(4px)", opacity: "0.9" },
          "50%": { opacity: "0.4" },
          "70%": { transform: "translateX(-3px)", opacity: "1" },
          "85%": { opacity: "0.5" },
        },
        "creature-radiant": {
          "0%, 100%": { transform: "translateY(0) scaleX(1)", filter: "brightness(1)" },
          "25%": { transform: "translateY(-2px) scaleX(1.04)", filter: "brightness(1.4)" },
          "50%": { transform: "translateY(1px) scaleX(0.97)", filter: "brightness(1.1)" },
          "75%": { transform: "translateY(-1px) scaleX(1.02)", filter: "brightness(1.5)" },
        },
        "creature-solar-pulse": {
          "0%": { transform: "translateX(0) translateY(0) scale(1)", filter: "brightness(1) drop-shadow(0 0 12px #ffd700)" },
          "10%": { transform: "translateX(1px) translateY(-1px) scale(1.03)", filter: "brightness(1.8) drop-shadow(0 0 25px #ffd700)" },
          "20%": { transform: "translateX(-1px) translateY(0px) scale(0.98)", filter: "brightness(1.1) drop-shadow(0 0 10px #ffd700)" },
          "35%": { transform: "translateX(0px) translateY(1px) scale(1.05)", filter: "brightness(2.0) drop-shadow(0 0 30px #ffaa00)" },
          "45%": { transform: "translateX(1px) translateY(-1px) scale(0.97)", filter: "brightness(1.0) drop-shadow(0 0 8px #ffd700)" },
          "60%": { transform: "translateX(-1px) translateY(0px) scale(1.04)", filter: "brightness(1.9) drop-shadow(0 0 28px #ffd700)" },
          "75%": { transform: "translateX(0px) translateY(1px) scale(1.0)", filter: "brightness(1.2) drop-shadow(0 0 14px #ffd700)" },
          "85%": { transform: "translateX(1px) translateY(-1px) scale(1.06)", filter: "brightness(2.2) drop-shadow(0 0 35px #ffcc00)" },
          "100%": { transform: "translateX(0) translateY(0) scale(1)", filter: "brightness(1) drop-shadow(0 0 12px #ffd700)" },
        },
        "creature-cosmic": {
          "0%, 100%": { transform: "scale(1) translateY(0)", filter: "brightness(1) drop-shadow(0 0 18px #aa66ff) drop-shadow(0 0 8px #00eeff)" },
          "15%": { transform: "scale(1.02) translateY(-1px)", filter: "brightness(1.3) drop-shadow(0 0 24px #aa66ff) drop-shadow(0 0 10px #00eeff)" },
          "35%": { transform: "scale(1.06) translateY(0px)", filter: "brightness(2.0) drop-shadow(0 0 40px #cc88ff) drop-shadow(0 0 18px #00eeff)" },
          "50%": { transform: "scale(1.03) translateY(1px)", filter: "brightness(1.5) drop-shadow(0 0 30px #aa66ff) drop-shadow(0 0 12px #00eeff)" },
          "70%": { transform: "scale(1.05) translateY(-1px)", filter: "brightness(1.8) drop-shadow(0 0 35px #cc88ff) drop-shadow(0 0 15px #00eeff)" },
          "85%": { transform: "scale(1.01) translateY(0px)", filter: "brightness(1.1) drop-shadow(0 0 20px #aa66ff) drop-shadow(0 0 8px #00eeff)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "creature-swim": "creature-swim 1.2s ease-in-out infinite",
        "creature-bounce": "creature-bounce 0.8s ease-in-out infinite",
        "creature-breathe": "creature-breathe 3s ease-in-out infinite",
        "creature-float": "creature-float 4s ease-in-out infinite",
        "creature-slither": "creature-slither 0.8s ease-in-out infinite",
        "creature-glide": "creature-glide 5s ease-in-out infinite",
        "creature-pulse": "creature-pulse 3s ease-in-out infinite",
        "creature-wingflap": "creature-wingflap 5s ease-in-out infinite",
        "creature-lure": "creature-lure 2s ease-in-out infinite",
        "creature-shuffle": "creature-shuffle 0.6s linear infinite",
        "creature-writhe": "creature-writhe 1.5s ease-in-out infinite",
        "creature-magma": "creature-magma 3s ease-in-out infinite",
        "creature-ghost": "creature-ghost 2s ease-in-out infinite",
        "creature-radiant": "creature-radiant 3s ease-in-out infinite",
        "creature-solar-pulse": "creature-solar-pulse 1.5s ease-in-out infinite",
        "creature-cosmic": "creature-cosmic 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
