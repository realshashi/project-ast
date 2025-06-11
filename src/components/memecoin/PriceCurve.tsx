import { FC } from "react";

interface PriceCurveProps {
  curveType: "Linear" | "Exponential" | "Sigmoid" | "Custom";
  kValue: number;
  currentPrice: number;
  totalSupply: number;
}

export const PriceCurve: FC<PriceCurveProps> = ({
  curveType,
  kValue,
  currentPrice,
  totalSupply,
}) => {
  const calculatePoints = () => {
    const points = [];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * totalSupply;
      let y;

      switch (curveType) {
        case "Linear":
          y = currentPrice + kValue * x;
          break;
        case "Exponential":
          y = currentPrice * Math.exp((kValue * x) / totalSupply);
          break;
        case "Sigmoid":
          y =
            currentPrice /
            (1 + Math.exp((-kValue * (x - totalSupply / 2)) / totalSupply));
          break;
        default:
          y = currentPrice;
      }

      points.push({ x, y });
    }

    return points;
  };

  const points = calculatePoints();
  const maxY = Math.max(...points.map((p) => p.y));
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${(p.x / totalSupply) * 400} ${200 - (p.y / maxY) * 180}`
    )
    .join(" ");

  return (
    <div className="p-4 bg-dark-secondary rounded-lg">
      <h3 className="text-lg font-semibold text-dark-text mb-4">Price Curve</h3>
      <svg width="400" height="200" className="w-full h-auto">
        <path d={path} stroke="url(#gradient)" strokeWidth="2" fill="none" />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-memecoin-primary)" />
            <stop offset="100%" stopColor="var(--color-memecoin-accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 text-sm text-dark-text-secondary">
        <span className="font-medium">{curveType} Curve</span>
        <span className="mx-2">•</span>
        <span>k = {kValue}</span>
      </div>
    </div>
  );
};
