import { Game } from "../../types";
import { GameItem } from "./GameItem";

export const GameList = ({
  games,
  sortBy,
  isAdmin,
  onEdit,
  onDelete,
}: {
  games: Game[];
  sortBy: "votes" | "name";
  isAdmin: boolean;
  onEdit: (game: Game) => void;
  onDelete: (game: string) => void;
}) => {
  return (
    <>
      {[...games]
        .sort((a, b) =>
          sortBy === "votes" ? b.votes - a.votes : a.game.localeCompare(b.game)
        )
        .map((g) => (
          <GameItem
            key={g.game}
            game={g}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
};
