import { useState } from "react";

export const LoginForm = ({ onLogin }: { onLogin: (password: string) => void }) => {
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col items-center mb-6">
      <input
        type="password"
        placeholder="Пароль модератора"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-3 py-2 mb-2"
      />
      <button
        onClick={() => onLogin(password)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Войти
      </button>
    </div>
  );
};