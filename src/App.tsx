import React, { useEffect, useState } from "react";
import Wheel from "./Wheel";

const API = process.env.REACT_APP_API_URL || "";

type Game = {
  game: string;
  votes: number;
  voters: string[];
};

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
  const [results, setResults] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

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
        setLastResult(null);
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
      .filter(Boolean);

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

  const handleSpinResult = (game: string, isWinner: boolean) => {
    setLastResult(game);
    setResults((r) => [...r, `🎯 Выпала: ${game}`]);
    if (isWinner) {
      setResults((r) => [...r, `🏆 Победитель: ${game}`]);
    }
  };

  const handleCloseModal = () => {
    if (lastResult) {
      const updated = wheelGames.filter((g) => g.game !== lastResult);
      setWheelGames(updated);
      setLastResult(null);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans relative">
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

      {wheelGames.length > 0 && (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4">🎡 Колесо фортуны</h2>

          <Wheel
            games={wheelGames}
            onResult={handleSpinResult}
            spinning={spinning}
            setSpinning={setSpinning}
            isAdmin={isAdmin}
          />

          <div className="mt-4">
            {isAdmin && (
              <button
                onClick={refreshGames}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Обновить рулетку
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-6 text-left">
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

      {lastResult && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">🎯 Выпала игра:</h2>
            <p className="text-lg mb-4">{lastResult}</p>
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
