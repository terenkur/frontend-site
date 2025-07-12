import React, { useRef, useEffect, useState } from "react";

type WheelProps = {
  games: { game: string; votes: number }[];
  onResult: (game: string, isWinner: boolean) => void;
  spinning: boolean;
  setSpinning: (s: boolean) => void;
  isAdmin: boolean;
};

const COLORS = [
  "#ff6384",
  "#36a2eb",
  "#ffce56",
  "#9966ff",
  "#4bc0c0",
  "#ff9f40",
];
const COEFFICIENT = 2;
const RADIUS = 150;
const CENTER = 200;

export default function Wheel({
  games,
  onResult,
  spinning,
  setSpinning,
  isAdmin,
}: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(0);
  const requestRef = useRef<number | null>(null);

  const maxVotes = Math.max(...games.map((g) => g.votes), 0);
  const segments = games.map((g) => ({
    name: g.game,
    weight: 1 + (maxVotes - g.votes) * COEFFICIENT,
  }));
  const totalWeight = segments.reduce((s, g) => s + g.weight, 0);

  const getSelectedGame = (deg: number): string => {
    const pointerAngle = (deg + 270) % 360; // 270° — это верх

    let acc = 0;
    for (const s of segments) {
      const portion = (s.weight / totalWeight) * 360;
      if (pointerAngle >= acc && pointerAngle < acc + portion) return s.name;
      acc += portion;
    }
    return segments[segments.length - 1].name;
  };

  const renderWheel = (rotationDeg = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 400, 400);

    let acc = 0;
    segments.forEach((seg, i) => {
      const start = acc;
      const end = acc + (seg.weight / totalWeight) * 360;
      acc = end;

      const startRad = ((start + rotationDeg) * Math.PI) / 180;
      const endRad = ((end + rotationDeg) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startRad, endRad);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      const mid = (start + end) / 2 + rotationDeg;
      const textAngle = (mid * Math.PI) / 180;
      const tx = CENTER + (RADIUS / 1.5) * Math.cos(textAngle);
      const ty = CENTER + (RADIUS / 1.5) * Math.sin(textAngle);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(seg.name, tx, ty);
    });
  };

  useEffect(() => {
    renderWheel(angle);
  }, [games, angle]);

  const spin = () => {
    if (!isAdmin || spinning || games.length <= 1) return;

    const finalAngle = angle + 360 * 5 + Math.random() * 360;
    const start = performance.now();
    const duration = 4000;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = angle + (finalAngle - angle) * easeOut;
      setAngle(current);
      renderWheel(current);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        const finalDeg = current % 360;
        const winner = getSelectedGame(finalDeg);
        onResult(winner, games.length === 2);
        setSpinning(false);
      }
    };

    setSpinning(true);
    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative w-[400px] h-[400px] mx-auto">
      {/* Канвас с рулеткой */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute top-0 left-0"
      />

      {/* Указатель */}
      <div
        className="absolute z-10 left-1/2 -translate-x-1/2"
        style={{ top: "-14px", pointerEvents: "none" }}
      >
        <svg width="40" height="30">
          <polygon points="20,30 10,10 30,10" fill="black" />
        </svg>
      </div>

      {/* Кнопка кручения */}
      {isAdmin && (
        <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2">
          <button
            onClick={spin}
            className="px-5 py-2 bg-purple-600 text-white rounded"
            disabled={spinning || games.length <= 1}
          >
            {spinning ? "Крутим..." : "Выбрать игру"}
          </button>
        </div>
      )}
    </div>
  );
}
