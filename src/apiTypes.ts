import {Game, WheelSettings } from './types'; // Добавляем этот импорт
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

export type GamesResponse = ApiResponse<Game[]>;
export type WheelSettingsResponse = ApiResponse<WheelSettings>;
