import { getCreatureData, getCreatureAnimation } from "@/data/creaturePixelData";

interface PixelCreatureProps {
  type?: string;
  className?: string;
}

const PixelCreature = ({ type = 'jellyfish', className = "w-32 h-32" }: PixelCreatureProps) => {
  const { grid, colorMap, glowColor, size = 16 } = getCreatureData(type);
  const animClass = getCreatureAnimation(type);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`${className} ${animClass}`}
      style={{
        filter: `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor}66)`,
        imageRendering: "pixelated",
      }}
    >
      {grid.flatMap((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colorMap[cell]} />
          ) : null
        )
      )}
    </svg>
  );
};

export default PixelCreature;
