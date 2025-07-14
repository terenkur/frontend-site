const API = process.env.REACT_APP_API_URL || "";

const getAuthHeaders = (token: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const fetchGames = async () => {
  const res = await fetch(`${API}/games`);
  return await res.json();
};

export const login = async (password: string) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return await res.json();
};

export const addGame = async (game: string, token: string | null) => {
  await fetch(`${API}/games`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ game }),
  });
};

export const deleteGame = async (game: string, token: string | null) => {
  await fetch(`${API}/games`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ game }),
  });
};

export const updateGame = async (
  oldName: string,
  newName: string,
  newVotes: number,
  newVoters: string[],
  token: string | null
) => {
  await fetch(`${API}/games`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      old_name: oldName,
      new_name: newName,
      new_votes: newVotes,
      new_voters: newVoters,
    }),
  });
};