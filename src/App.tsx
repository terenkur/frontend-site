import React, { useEffect, useRef, useState } from "react";

const API = process.env.REACT_APP_API_URL || "";

type Game = {
  game: string;
  votes: number;
  voters: string[];
};

const COLORS = [
  "#ff6384",
  "#36a2eb",
  "#ffce56",
  "#4bc0c0",
  "#9966ff",
  "#ff9f40",
];

const COEFFICIENT = 2;
const RADIUS = 150;
const CENTER = 200;

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [sortBy, setSortBy] = useState<"votes" | "name">("votes");

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [password, setPassword] = useState("");

  const [newGameName, setNewGameName] = useState("");
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedVotes, setEditedVotes] = useState<number>(0);
  const [editedVoters, setEditedVoters] = useState<string>("");

  const [wheelGames, setWheelGames] = useState<Game[]>([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [angle, setAngle] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const requestRef = useRef<number | null>(null);

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

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const handleAddGame = async () => {
    if (!newGameName.trim()) return;
    await fetch(`${API}/games`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ game: newGameName }),
    });
    setNewGameName("");
    refreshGames();
  };

  const handleDeleteGame = async (game: string) => {
    await fetch(`${API}/games`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ game }),
    });
    refreshGames();
  };

  const handleUpdateGame = async (oldName: string) => {
    const newVoterList = editedVoters
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter((v) => v);
    await fetch(`${API}/games`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        old_name: oldName,
        new_name: editedName,
        new_votes: editedVotes,
        new_voters: newVoterList,
      }),
    });
    setEditingGame(null);
    refreshGames();
  };

  const maxVotes = Math.max(...wheelGames.map((g) => g.votes), 0);

  const segments = wheelGames.map((g) => ({
    name: g.game,
    weight: 1 + (maxVotes - g.votes) * COEFFICIENT,
  }));

  const totalWeight = segments.reduce((s, g) => s + g.weight, 0);

  const handleSpin = () => {
    if (wheelGames.length <= 1 || mustSpin) return;
    const finalAngle = angle + 360 * 5 + Math.random() * 360;
    const start = performance.now();
    const duration = 5000;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = angle + (finalAngle - angle) * easeOut;
      setAngle(current);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        const winner = getSelectedGame(current % 360);
        setResults((r) => [...r, `Выпала: ${winner}`]);
        const updated = wheelGames.filter((g) => g.game !== winner);
        setWheelGames(updated);
        if (updated.length === 1) {
          setResults((r) => [...r, `🎉 Победитель: ${updated[0].game}`]);
        }
        setMustSpin(false);
      }
    };

    setMustSpin(true);
    requestRef.current = requestAnimationFrame(animate);
  };

  const getSelectedGame = (deg: number): string => {
    let acc = 0;
    for (const s of segments) {
      const portion = (s.weight / totalWeight) * 360;
      if (deg >= acc && deg < acc + portion) return s.name;
      acc += portion;
    }
    return segments[segments.length - 1].name;
  };

  const renderWheel = () => {
    let acc = 0;
    return segments.map((seg, i) => {
      const start = acc;
      const end = acc + (seg.weight / totalWeight) * 360;
      acc = end;

      const x1 = CENTER + RADIUS * Math.cos((Math.PI * start) / 180);
      const y1 = CENTER + RADIUS * Math.sin((Math.PI * start) / 180);
      const x2 = CENTER + RADIUS * Math.cos((Math.PI * end) / 180);
      const y2 = CENTER + RADIUS * Math.sin((Math.PI * end) / 180);
      const large = end - start > 180 ? 1 : 0;
      const d = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${x2} ${y2} Z`;

      const mid = start + (end - start) / 2;
      const tx = CENTER + (RADIUS / 1.5) * Math.cos((Math.PI * mid) / 180);
      const ty = CENTER + (RADIUS / 1.5) * Math.sin((Math.PI * mid) / 180);

      return (
        <g key={i}>
          <path d={d} fill={COLORS[i % COLORS.length]} stroke="#fff" />
          <text
            x={tx}
            y={ty}
            fill="#fff"
            fontSize="13"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {seg.name}
          </text>
        </g>
      );
    });
  };

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
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSortBy("votes")}
              className={`px-3 py-1 rounded ${
                sortBy === "votes" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              По голосам
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`px-3 py-1 rounded ${
                sortBy === "name" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              По алфавиту
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              placeholder="Новая игра"
              className="border px-3 py-2 mr-2 rounded"
            />
            <button
              onClick={handleAddGame}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Добавить
            </button>
          </div>
        </>
      )}

      {[...games]
        .sort((a, b) =>
          sortBy === "votes" ? b.votes - a.votes : a.game.localeCompare(b.game)
        )
        .map((g) => (
          <div
            key={g.game}
            className="mb-4 border rounded p-4 shadow hover:shadow-md transition"
          >
            {editingGame === g.game ? (
              <>
                <input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border px-2 py-1 mb-2 w-full"
                />
                <input
                  type="number"
                  value={editedVotes}
                  onChange={(e) => setEditedVotes(Number(e.target.value))}
                  className="border px-2 py-1 mb-2 w-full"
                />
                <input
                  value={editedVoters}
                  onChange={(e) => setEditedVoters(e.target.value)}
                  className="border px-2 py-1 mb-2 w-full"
                  placeholder="Голосовавшие (через запятую)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateGame(g.game)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditingGame(null)}
                    className="px-3 py-1 bg-gray-300 rounded"
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">{g.game}</div>
                <div>Голосов: {g.votes}</div>
                {g.voters.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Проголосовали: {g.voters.join(", ")}
                  </div>
                )}
                {isAdmin && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGame(g.game);
                        setEditedName(g.game);
                        setEditedVotes(g.votes);
                        setEditedVoters(g.voters.join(", "));
                      }}
                      className="px-3 py-1 bg-yellow-400 rounded"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteGame(g.game)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

      {isAdmin && wheelGames.length > 1 && (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4">🎡 Колесо фортуны</h2>
          <div className="flex justify-center">
            <svg width="400" height="400">
              <polygon points="200,0 190,30 210,30" fill="black" />
              <g transform={`rotate(${angle % 360} ${CENTER} ${CENTER})`}>
                {renderWheel()}
              </g>
            </svg>
          </div>
          <button
            onClick={handleSpin}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
            disabled={mustSpin}
          >
            {mustSpin ? "Крутим..." : "Выбрать игру"}
          </button>

          {results.length > 0 && (
            <div className="mt-4 text-left">
              <h3 className="font-semibold">Итоги:</h3>
              <ul className="list-disc pl-6">
                {results.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
