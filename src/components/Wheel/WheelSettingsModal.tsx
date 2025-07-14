import { useState, useEffect } from 'react';
import { WheelSettings } from '../../types';

interface WheelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: WheelSettings) => void;
  initialSettings: WheelSettings;
}

export const WheelSettingsModal = ({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}: WheelSettingsModalProps) => {
  const [settings, setSettings] = useState<WheelSettings>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Настройки рулетки</h2>
        
        <div className="mb-4">
          <label className="block mb-2">
            Коэффициент влияния голосов:
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={settings.coefficient}
              onChange={(e) => setSettings({
                ...settings,
                coefficient: parseFloat(e.target.value) || 0.1
              })}
              className="border p-2 w-full mt-1"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            Вес для игр с 0 голосами:
            <input
              type="number"
              min="1"
              value={settings.zero_votes_weight}
              onChange={(e) => setSettings({
                ...settings,
                zero_votes_weight: parseInt(e.target.value) || 1
              })}
              className="border p-2 w-full mt-1"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Отмена
          </button>
          <button
            onClick={() => onSave(settings)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};