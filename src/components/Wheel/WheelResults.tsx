export const WheelResults = ({ results }: { results: string[] }) => {
  if (results.length === 0) return null;

  return (
    <div className="mt-6 text-left">
      <h3 className="font-semibold">Итоги:</h3>
      <ul className="list-disc pl-6">
        {results.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
};
