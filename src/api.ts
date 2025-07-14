import {Game, WheelSettings } from './types'; // Добавляем этот импорт

const API = process.env.REACT_APP_API_URL || "https://web-production-ec36f.up.railway.app";

export const getAuthHeaders = (token: string | null): Record<string, string> => {
  if (!token) {
    throw new Error("Токен не предоставлен");
  }
  
 return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "Origin": "https://frontend-site-production.up.railway.app"
  };
};

export const fetchGames = async (): Promise<Game[]> => {
  try {
    const res = await fetch(`${API}/games`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Валидация структуры ответа
    if (!Array.isArray(data)) {
      throw new Error("Invalid response format");
    }
    
    return data as Game[];
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

export const login = async (password: string): Promise<{ token: string }> => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });
  
  if (!res.ok) {
    throw new Error("Неверный пароль");
  }
  
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

// Добавляем новые функции API
export const fetchWheelSettings = async (token: string | null): Promise<WheelSettings> => {
  try {
    const res = await fetch(`${API}/wheel-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch wheel settings:', error);
    // Возвращаем значения по умолчанию при ошибке
    return {
      coefficient: 2,
      zero_votes_weight: 40
    };
  }
};

export const updateWheelSettings = async (
  settings: WheelSettings,
  token: string | null
): Promise<void> => {
  const res = await fetch(`${API}/wheel-settings`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(settings),
    credentials: "include"
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
};