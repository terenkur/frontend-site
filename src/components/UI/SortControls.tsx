export const SortControls = ({
  sortBy,
  setSortBy,
}: {
  sortBy: "votes" | "name";
  setSortBy: (value: "votes" | "name") => void;
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => setSortBy("votes")}
        className={`px-3 py-1 rounded ${
          sortBy === "votes" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        По голосам
      </button>
      <button
        onClick={() => setSortBy("name")}
        className={`px-3 py-1 rounded ${
          sortBy === "name" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        По алфавиту
      </button>
    </div>
  );
};