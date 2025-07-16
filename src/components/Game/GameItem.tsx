import { useState } from "react";
import { Game } from "../../types";

export const GameItem = ({
  game,
  isAdmin,
  onEdit,
  onDelete,
}: {
  game: Game;
  isAdmin: boolean;
  onEdit: (game: Game) => void;
  onDelete: (game: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(game.game);
  const [editedVotes, setEditedVotes] = useState(game.votes);
  const [editedVoters, setEditedVoters] = useState(game.voters.join(", "));

  const handleSave = () => {
    onEdit({
      ...game,
      game: editedName,
      votes: editedVotes,
      voters: editedVoters.split(",").map(v => v.trim()).filter(v => v),
    });
    setIsEditing(false);
  };

  return (
    <div className="mb-4 border rounded p-4 shadow hover:shadow-md transition">
      {isEditing ? (
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
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Сохранить
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Отмена
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-xl font-semibold">{game.game}</div>
          <div>Голосов: {game.votes}</div>
          {game.voters.length > 0 && (
            <div className="text-sm text-gray-500">
              Проголосовали: {game.voters.join(", ")}
            </div>
          )}
          {isAdmin && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedName(game.game);
                  setEditedVotes(game.votes);
                  setEditedVoters(game.voters.join(", "));
                }}
                className="px-3 py-1 bg-yellow-400 rounded"
              >
                Редактировать
              </button>
              <button
                onClick={() => onDelete(game.game)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Удалить
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
