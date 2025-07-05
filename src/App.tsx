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

  useEffect(() => {
    fetch(`${API}/games`)
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch(console.error);
  }, []);

  const sortedGames = [...games].sort((a, b) => {
    if (sortBy === "votes") return b.votes - a.votes;
    return a.game.localeCompare(b.game);
  });

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Голосование за игры
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setSortBy("votes")}
          className={`px-4 py-2 rounded ${
            sortBy === "votes"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          } transition`}
        >
          Сортировать по голосам
        </button>
        <button
          onClick={() => setSortBy("name")}
          className={`px-4 py-2 rounded ${
            sortBy === "name"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          } transition`}
        >
          Сортировать по алфавиту
        </button>
      </div>

      {sortedGames.map((g) => (
        <div
          key={g.game}
          className="mb-4 border rounded-lg p-4 shadow hover:shadow-md transition"
        >
          <div className="text-xl font-semibold text-gray-800">{g.game}</div>
          <div className="text-gray-700">Голосов: {g.votes}</div>
          {g.voters.length > 0 && (
            <div className="text-sm text-gray-500 mt-1">
              Проголосовали: {g.voters.join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
