import { Star } from "lucide-react";

interface UserPointsChipProps {
  points?: number;
}

export function UserPointsChip({ points = 240 }: UserPointsChipProps) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md"
      style={{
        backgroundColor: "hsl(0 0% 0% / 0.5)",
        borderColor: "hsl(180 100% 50% / 0.4)",
      }}
    >
      <Star className="w-4 h-4 fill-primary text-primary" />
      <span className="text-sm font-bold text-primary tracking-wide">{points} PTS</span>
    </div>
  );
}