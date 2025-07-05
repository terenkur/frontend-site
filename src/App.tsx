import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL || "";

type Game = {
  game: string;
  votes: number;
  voters: string[];
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetch(API + "/games")
      .then((res) => res.json())
      .then((data) => setGames(data));
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold red mb-4">Голосование за игры</h1>
      {[...games]
        .sort((a, b) => b.votes - a.votes)
        .map((g) => (
          <div key={g.game} className="mb-2 border rounded p-2 shadow">
            <div className="text-xl font-semibold">{g.game}</div>
            <div>Голосов: {g.votes}</div>
          </div>
        ))}
    </div>
  );
}
