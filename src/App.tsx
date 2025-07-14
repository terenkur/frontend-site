import { useEffect, useState } from "react";
import { WheelSettingsModal } from "./components/Wheel/WheelSettingsModal";
import { LoginForm } from "./components/Auth/LoginForm";
import { GameList } from "./components/Game/GameList";
import { SortControls } from "./components/UI/SortControls";
import { AddGameForm } from "./components/UI/AddGameForm";
import { WheelComponent } from "./components/Wheel/WheelComponent";
import { WheelResults } from "./components/Wheel/WheelResults";
import { WheelModal } from "./components/Wheel/WheelModal";
import { Game, WheelSettings } from "./types";
import { fetchGames, login, addGame, deleteGame, updateGame, fetchWheelSettings, updateWheelSettings, getAuthHeaders} from "./api";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000"; // Явно укажите ваш API URL

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [sortBy, setSortBy] = useState<"votes" | "name">("votes");
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [wheelGames, setWheelGames] = useState<Game[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [wheelSettings, setWheelSettings] = useState<WheelSettings>({
    coefficient: 2,
    zero_votes_weight: 40
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const isAdmin = !!token;

const loadInitialData = async () => {
  try {
    const gamesData = await fetchGames();
    setGames(gamesData);
    setWheelGames(gamesData);
    
    if (isAdmin) {
      const settings = await fetchWheelSettings(token);
      setWheelSettings(settings);
    }
  } catch (error) {
    console.error("Initial data load error:", error);
  }
};

const corsErrorHandler = async (error: Error) => {
  console.warn("CORS error detected, trying proxy approach...");
  try {
    // Альтернативный запрос через CORS proxy
    const res = await fetch(`https://cors-anywhere.herokuapp.com/${API}/wheel-settings`, {
      headers: getAuthHeaders(token)
    });
    return await res.json();
  } catch (proxyError) {
    throw new Error(`Both direct and proxy requests failed: ${proxyError}`);
  }
};

const saveWheelSettings = async (settings: WheelSettings) => {
    if (!token) return;
    
    try {
      await updateWheelSettings(settings, token);
      setWheelSettings(settings);
      setShowSettingsModal(false);
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error);
      alert("Не удалось сохранить настройки");
    }
  };

  
   useEffect(() => {
    loadInitialData();
  }, [token]);

  const handleSaveSettings = async (settings: WheelSettings) => {
    if (!token) return;
    
    try {
      await updateWheelSettings(settings, token);
      setWheelSettings(settings);
      setShowSettingsModal(false);
      // Можно добавить уведомление об успешном сохранении
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error);
      alert("Не удалось сохранить настройки");
    }
  };

  const refreshGames = async () => {
    try {
    const data = await fetchGames();
    setGames(data);
    setWheelGames(data); // Важно: обновляем игры для рулетки
    setResults([]);
    setSelected(null);
    setShowModal(false);
  } catch (error) {
    console.error("Ошибка загрузки игр:", error);
  }
  };

  const handleLogin = async (password: string) => {
    try {
      const data = await login(password);
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch (error) {
      console.error("Ошибка входа:", error);
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

      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Настройки рулетки
          </button>
        </div>
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
            wheelSettings={wheelSettings}
          />

          <WheelSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}  // Используем handleSaveSettings вместо saveWheelSettings
        initialSettings={wheelSettings}
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