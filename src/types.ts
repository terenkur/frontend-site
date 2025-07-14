export type Game = {
  game: string;
  votes: number;
  voters: string[];
};

export type WheelProps = {
  games: Game[];
  onResult: (game: string, isWinner: boolean) => void;
  spinning: boolean;
  setSpinning: (spinning: boolean) => void;
  isAdmin: boolean;
};