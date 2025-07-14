import React, { useRef, useEffect, useState } from "react";
import { WheelSettings } from "./types";

/*type WheelProps = {
  games: { game: string; votes: number }[];
  onResult: (game: string, isWinner: boolean) => void;
  spinning: boolean;
  setSpinning: (s: boolean) => void;
  isAdmin: boolean;
};*/

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
const POINTER_ANGLE = 270;
const ZERO_VOTES_WEIGHT = 40; // Новый параметр для веса игр с 0 голосами

interface WheelProps {
  games: { game: string; votes: number }[];
  onResult: (game: string, isWinner: boolean) => void;
  spinning: boolean;
  setSpinning: (s: boolean) => void;
  isAdmin: boolean;
  wheelSettings: WheelSettings; // Добавляем настройки в пропсы
}

export default function Wheel({
  games,
  onResult,
  spinning,
  setSpinning,
  isAdmin,
  wheelSettings, // Получаем настройки из пропсов
}: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(0);
  const requestRef = useRef<number | null>(null);

  const maxVotes = Math.max(...games.map((g) => g.votes), 0);
  const segments = games.map((g) => ({
    name: g.game,
    weight: g.votes === 0 
      ? wheelSettings.zero_votes_weight 
      : 1 + (maxVotes - g.votes) * wheelSettings.coefficient,
  }));
  const totalWeight = segments.reduce((s, g) => s + g.weight, 0);

  // Нормализует угол в диапазон [0, 360)
  const normalizeAngle = (deg: number) => ((deg % 360) + 360) % 360;

  const getSelectedGame = (currentAngle: number): string => {
    const normalizedAngle = normalizeAngle(currentAngle);
    let accumulatedAngle = 0;
    
    for (const segment of segments) {
      const segmentAngle = (segment.weight / totalWeight) * 360;
      if (normalizedAngle >= accumulatedAngle && 
          normalizedAngle < accumulatedAngle + segmentAngle) {
        return segment.name;
      }
      accumulatedAngle += segmentAngle;
    }
    
    return segments[segments.length - 1].name;
  };

  const renderWheel = (currentAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 400, 400);

    let accumulatedAngle = 0;
    segments.forEach((segment, index) => {
      const segmentAngle = (segment.weight / totalWeight) * 360;
      const startAngle = accumulatedAngle + currentAngle;
      const endAngle = startAngle + segmentAngle;

      // Отрисовка сегмента
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(
        CENTER, 
        CENTER, 
        RADIUS, 
        (startAngle * Math.PI) / 180, 
        (endAngle * Math.PI) / 180
      );
      ctx.closePath();
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      // Отрисовка текста
      const middleAngle = startAngle + segmentAngle / 2;
      const textX = CENTER + (RADIUS / 1.5) * Math.cos((middleAngle * Math.PI) / 180);
      const textY = CENTER + (RADIUS / 1.5) * Math.sin((middleAngle * Math.PI) / 180);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(segment.name, textX, textY);

      accumulatedAngle += segmentAngle;
    });
  };

  useEffect(() => {
    renderWheel(angle);
  }, [games, angle]);

  const spin = () => {
    if (!isAdmin || spinning || games.length <= 1) return;
    
    const spinDuration = 4000; // 4 секунды
    const spinRotations = 5; // 5 полных оборотов
    const randomAngle = Math.random() * 360;
    const finalAngle = angle + spinRotations * 360 + randomAngle;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / spinDuration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentAngle = angle + (finalAngle - angle) * easeOutProgress;
      
      setAngle(currentAngle);
      renderWheel(currentAngle);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Корректный расчёт угла под указателем
        const angleUnderPointer = normalizeAngle(POINTER_ANGLE - normalizeAngle(currentAngle));
        const winner = getSelectedGame(angleUnderPointer);
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

      {/* Обновленный указатель - теперь правильно ориентирован и позиционирован */}
      <div
        className="absolute z-10 left-1/2 -translate-x-1/2"
        style={{ 
          top: "10px", // Уменьшил отступ сверху для приближения к рулетке
          pointerEvents: "none",
          transform: "translateX(-50%) rotate(180deg)" // Перевернул стрелку
        }}
      >
        <svg width="40" height="25" viewBox="0 0 20 12.5">
  <path 
    d="M10 0 L17.5 10 L2.5 10 Z"
    fill="#ff0000" // Красный цвет
    stroke="#fff"
    strokeWidth="1.5"
  />
</svg>
      </div>

      {/* Кнопка (без изменений) */}
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