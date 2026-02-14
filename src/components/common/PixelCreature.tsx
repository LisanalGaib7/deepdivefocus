interface PixelCreatureProps {
  className?: string;
}

const PixelCreature = ({ className = "w-32 h-32" }: PixelCreatureProps) => {
  const c = "#00ff88"; // neon green
  const t = "#00ffcc"; // tentacle cyan
  const e = "#ffffff"; // eyes

  // 16x16 pixel grid - jellyfish design
  // 0=transparent, 1=body, 2=tentacle, 3=eye
  const grid: number[][] = [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,3,3,1,1,1,1,3,3,1,1,1,0],
    [0,1,1,1,3,3,1,1,1,1,3,3,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,2,0,2,0,0,2,0,2,0,0,0,0],
    [0,0,0,2,0,0,0,2,2,0,0,0,2,0,0,0],
    [0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0],
    [0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0],
    [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
    [0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  const colorMap: Record<number, string> = { 1: c, 2: t, 3: e };

  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      style={{ filter: "drop-shadow(0 0 8px #00ff88) drop-shadow(0 0 16px #00ff8866)", imageRendering: "pixelated" }}
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
