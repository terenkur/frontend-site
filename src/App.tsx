import { useEffect, useState } from "react";
import { LoginForm } from "./components/Auth/LoginForm";
import { GameList } from "./components/Game/GameList";
import { SortControls } from "./components/UI/SortControls";
import { AddGameForm } from "./components/UI/AddGameForm";
import { WheelComponent } from "./components/Wheel/WheelComponent";
import { WheelResults } from "./components/Wheel/WheelResults";
import { WheelModal } from "./components/Wheel/WheelModal";
import { Game } from "./types";
import { fetchGames, login, addGame, deleteGame, updateGame } from "./api";

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [sortBy, setSortBy] = useState<"votes" | "name">("votes");
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [wheelGames, setWheelGames] = useState<Game[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const isAdmin = !!token;

  useEffect(() => {
    refreshGames();
  }, []);

  const refreshGames = async () => {
    const data = await fetchGames();
    setGames(data);
    setWheelGames(data);
    setResults([]);
    setSelected(null);
    setShowModal(false);
  };

  const handleLogin = async (password: string) => {
    try {
      const data = await login(password);
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (error) {
      alert("Неверный пароль");
    }
  };

  const handleAddGame = async (name: string) => {
    await addGame(name, token);
    await refreshGames();
  };

  const handleDeleteGame = async (game: string) => {
    await deleteGame(game, token);
    await refreshGames();
  };

  const handleEditGame = async (game: Game) => {
    await updateGame(
      game.game,
      game.game,
      game.votes,
      game.voters,
      token
    );
    await refreshGames();
  };

  const handleResult = (game: string, isWinner: boolean) => {
    setSelected(game);
    setResults((r) => [...r, `🎯 Выпала: ${game}`]);
    if (isWinner) {
      setResults((r) => [...r, `🏆 Победитель: ${game}`]);
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    if (selected) {
      setWheelGames((prev) => prev.filter((g) => g.game !== selected));
    }
    setShowModal(false);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Голосование за игры</h1>

      {!isAdmin ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <>
          <SortControls sortBy={sortBy} setSortBy={setSortBy} />
          <AddGameForm onAdd={handleAddGame} />
        </>
      )}

      <GameList
        games={games}
        sortBy={sortBy}
        isAdmin={isAdmin}
        onEdit={handleEditGame}
        onDelete={handleDeleteGame}
      />

      {wheelGames.length > 0 && (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4">🎡 Колесо фортуны</h2>
          <WheelComponent
            games={wheelGames}
            onResult={handleResult}
            spinning={spinning}
            setSpinning={setSpinning}
            isAdmin={isAdmin}
          />

          {isAdmin && (
            <button
              onClick={refreshGames}
              className="mt-8 px-4 py-2 bg-gray-300 rounded"
            >
              Обновить рулетку
            </button>
          )}

          <WheelResults results={results} />
        </div>
      )}

      <WheelModal
        show={showModal}
        selected={selected}
        onClose={handleModalClose}
      />
    </div>
  );
}