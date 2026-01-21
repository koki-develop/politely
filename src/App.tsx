import { useCallback, useEffect, useState } from "react";
import { VoiceInput } from "./components/VoiceInput";

type HealthResponse = {
  status: string;
  timestamp: string;
};

export const App = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/api/health");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Politely</h1>

      <VoiceInput />

      <div className="border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">API Health Check</h2>
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {health && (
          <div className="space-y-1">
            <p>
              Status:{" "}
              <span className="font-mono text-green-600">{health.status}</span>
            </p>
            <p>
              Timestamp:{" "}
              <span className="font-mono text-gray-600">
                {health.timestamp}
              </span>
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={checkHealth}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};
