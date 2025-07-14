export const WheelModal = ({
  show,
  selected,
  onClose,
}: {
  show: boolean;
  selected: string | null;
  onClose: () => void;
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg text-center max-w-md">
        <h2 className="text-xl font-bold mb-4">🎯 Выпала игра:</h2>
        <p className="text-lg font-semibold mb-6">{selected}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Закрыть и убрать игру
        </button>
      </div>
    </div>
  );
};