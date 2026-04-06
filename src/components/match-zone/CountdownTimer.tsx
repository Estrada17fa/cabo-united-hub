import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <TimeBlock value={timeLeft.days} label="DÍAS" />
      <span className="text-3xl sm:text-4xl font-extrabold text-primary">:</span>
      <TimeBlock value={timeLeft.hours} label="HRS" />
      <span className="text-3xl sm:text-4xl font-extrabold text-primary">:</span>
      <TimeBlock value={timeLeft.minutes} label="MIN" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
}

function getTimeLeft(target: Date) {
  const now = new Date().getTime();
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}
