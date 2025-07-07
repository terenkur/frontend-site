import React, { useEffect, useState, useRef } from "react";

const API = process.env.REACT_APP_API_URL || "";

type Game = {
  game: string;
  votes: number;
  voters: string[];
};

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

function SVGWheel({
  segments,
  spinning,
  onSelect,
  onStop,
}: {
  segments: { name: string; weight: number }[];
  spinning: boolean;
  onSelect: (game: string) => void;
  onStop: () => void;
}) {
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const requestRef = useRef<number | null>(null);
  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
  const radius = 150;
  const center = 200;
  const duration = 5000;

  useEffect(() => {
    if (spinning && !isSpinning) startSpin();
  }, [spinning]);

  const startSpin = () => {
    setIsSpinning(true);
    const finalAngle = angle + 360 * 5 + Math.random() * 360;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = angle + (finalAngle - angle) * easeOut;
      setAngle(currentAngle);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const selected = getSelectedSegment(currentAngle % 360);
        onSelect(selected);
        onStop();
      }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  const getSelectedSegment = (finalDeg: number): string => {
    let acc = 0;
    for (let seg of segments) {
      const portion = (seg.weight / totalWeight) * 360;
      if (finalDeg < acc + portion) return seg.name;
      acc += portion;
    }
    return segments[segments.length - 1].name;
  };

  const renderSlices = () => {
    let acc = 0;
    return segments.map((seg, i) => {
      const angleStart = acc;
      const angleEnd = acc + (seg.weight / totalWeight) * 360;
      acc = angleEnd;

      const x1 = center + radius * Math.cos((Math.PI * angleStart) / 180);
      const y1 = center + radius * Math.sin((Math.PI * angleStart) / 180);
      const x2 = center + radius * Math.cos((Math.PI * angleEnd) / 180);
      const y2 = center + radius * Math.sin((Math.PI * angleEnd) / 180);
      const largeArcFlag = angleEnd - angleStart > 180 ? 1 : 0;

      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return (
        <path
          key={seg.name + i}
          d={d}
          fill={COLORS[i % COLORS.length]}
          stroke="#fff"
          strokeWidth="2"
        />
      );
    });
  };

  const renderLabels = () => {
    let acc = 0;
    return segments.map((seg, i) => {
      const midAngle = acc + ((seg.weight / totalWeight) * 360) / 2;
      acc += (seg.weight / totalWeight) * 360;

      const x = center + (radius / 1.5) * Math.cos((Math.PI * midAngle) / 180);
      const y = center + (radius / 1.5) * Math.sin((Math.PI * midAngle) / 180);

      return (
        <text
          key={seg.name + "-label"}
          x={x}
          y={y}
          fill="#fff"
          fontSize="14"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {seg.name}
        </text>
      );
    });
  };

  return (
    <div className="flex justify-center">
      <svg width="400" height="400">
        <g transform={`rotate(${angle} ${center} ${center})`}>
          {renderSlices()}
          {renderLabels()}
        </g>
        <polygon points="200,0 190,30 210,30" fill="black" />
      </svg>
    </div>
  );
}

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [password, setPassword] = useState<string>("");
  const [mustSpin, setMustSpin] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [wheelGames, setWheelGames] = useState<Game[]>([]);

  const COEFFICIENT = 2;
  const isAdmin = !!token;

  useEffect(() => {
    refreshGames();
  }, []);

  const refreshGames = () => {
    fetch(`${API}/games`)
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setWheelGames(data);
        setResults([]);
      });
  };

  const handleLogin = async () => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return alert("Неверный пароль");

    const data = await res.json();
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setPassword("");
  };

  const handleSpin = () => {
    if (wheelGames.length <= 1 || mustSpin) return;
    setMustSpin(true);
  };

  const handleSelect = (selectedGame: string) => {
    setResults((prev) => [...prev, `Выпала: ${selectedGame}`]);
    setWheelGames((prev) => {
      const updated = prev.filter((g) => g.game !== selectedGame);
      if (updated.length === 1) {
        setResults((r) => [...r, `🎉 Победитель: ${updated[0].game}`]);
      }
      return updated;
    });
  };

  const maxVotes = Math.max(...wheelGames.map((g) => g.votes), 0);
  const segments = wheelGames.map((g) => ({
    name: g.game,
    weight: 1 + (maxVotes - g.votes) * COEFFICIENT,
  }));

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Голосование за игры
      </h1>

      {!isAdmin ? (
        <div className="flex flex-col items-center mb-6">
          <input
            type="password"
            placeholder="Пароль модератора"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2 mb-2"
          />
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Войти
          </button>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <SVGWheel
            segments={segments}
            spinning={mustSpin}
            onSelect={handleSelect}
            onStop={() => setMustSpin(false)}
          />
          <button
            onClick={handleSpin}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
            disabled={mustSpin || wheelGames.length <= 1}
          >
            {mustSpin ? "Крутим..." : "Выбрать игру"}
          </button>
          {results.length > 0 && (
            <ul className="mt-4 text-sm text-left">
              {results.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
