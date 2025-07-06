import React, { useEffect, useState } from "react";

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
  const [password, setPassword] = useState<string>("");

  const [newGameName, setNewGameName] = useState("");
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedVotes, setEditedVotes] = useState<number>(0);
  const [editedVoters, setEditedVoters] = useState<string>("");

  const [rouletteGames, setRouletteGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [winner, setWinner] = useState<Game | null>(null);
  const [spinning, setSpinning] = useState(false);

  const COEFFICIENT = 2;
  const isAdmin = !!token;

  useEffect(() => {
    refreshGames();
  }, []);

  const refreshGames = () =>
    fetch(`${API}/games`)
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setRouletteGames(data);
      });

  const handleLogin = async () => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      alert("Неверный пароль");
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setPassword("");
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
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

  const spinRoulette = () => {
    if (!isAdmin || spinning || rouletteGames.length <= 1) return;

    const maxVotes = Math.max(...rouletteGames.map((g) => g.votes));
    const weighted: Game[] = [];

    for (const game of rouletteGames) {
      const weight = 1 + (maxVotes - game.votes) * COEFFICIENT;
      for (let i = 0; i < weight; i++) weighted.push(game);
    }

    const randomIndex = Math.floor(Math.random() * weighted.length);
    const selected = weighted[randomIndex];

    setSpinning(true);
    setTimeout(() => {
      setSelectedGame(selected);
      const updated = rouletteGames.filter((g) => g.game !== selected.game);
      setRouletteGames(updated);
      if (updated.length === 1) setWinner(updated[0]);
      setSpinning(false);
    }, 1000);
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
                  placeholder="Название игры"
                />
                <input
                  type="number"
                  value={editedVotes}
                  onChange={(e) => setEditedVotes(Number(e.target.value))}
                  className="border px-2 py-1 mb-2 w-full"
                  placeholder="Голосов"
                />
                <input
                  value={editedVoters}
                  onChange={(e) => setEditedVoters(e.target.value)}
                  className="border px-2 py-1 mb-2 w-full"
                  placeholder="Голосующие (через запятую)"
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

      {games.length > 1 && isAdmin && (
        <div className="my-10 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">🎰 Рулетка</h2>
          <button
            onClick={spinRoulette}
            disabled={spinning || rouletteGames.length <= 1}
            className="px-5 py-2 bg-purple-600 text-white rounded"
          >
            {spinning ? "Крутим..." : "Выбрать игру"}
          </button>

          {selectedGame && !winner && (
            <div className="mt-6 text-lg animate-pulse">
              🎯 Выпала игра: <strong>{selectedGame.game}</strong>
            </div>
          )}

          {winner && (
            <div className="mt-6 text-2xl text-green-700 font-bold">
              🏆 Победитель: {winner.game}
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Оставшиеся игры:</h3>
            <ul className="list-disc pl-6">
              {rouletteGames.map((g) => (
                <li key={g.game}>
                  {g.game} — {g.votes} голосов
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
