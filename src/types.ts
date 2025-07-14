export interface Game {
  game: string;
  votes: number;
  voters: string[];
}

export type WheelProps = {
  games: Game[];
  onResult: (game: string, isWinner: boolean) => void;
  spinning: boolean;
  setSpinning: (spinning: boolean) => void;
  isAdmin: boolean;
};

export interface WheelSettings {
  coefficient: number;
  zero_votes_weight: number;
}
