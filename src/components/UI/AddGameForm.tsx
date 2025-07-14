import { useState } from "react";

export const AddGameForm = ({ onAdd }: { onAdd: (name: string) => void }) => {
  const [newGameName, setNewGameName] = useState("");

  const handleAdd = () => {
    if (newGameName.trim()) {
      onAdd(newGameName);
      setNewGameName("");
    }
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={newGameName}
        onChange={(e) => setNewGameName(e.target.value)}
        placeholder="Новая игра"
        className="border px-3 py-2 mr-2 rounded"
      />
      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Добавить
      </button>
    </div>
  );
};