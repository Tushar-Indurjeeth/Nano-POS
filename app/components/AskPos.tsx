"use client";

import { useState } from "react";
import { parseQuery } from "@/lib/utils";
import { AskPosProps } from "../interfaces/AskPosProps";

export default function AskPos({ onNewReportData }: AskPosProps) {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuerySubmit = async () => {
    setLoading(true);
    setError(null);
    onNewReportData(null, null, undefined, undefined);

    const parsed = parseQuery(query);

    if (parsed.error) {
      setError(parsed.error);
      setLoading(false);
      onNewReportData(null, parsed.error);
      return;
    }

    if (parsed.startDate && parsed.endDate) {
      try {
        const response = await fetch(
          `/api/daily-sales?startDate=${parsed.startDate}&endDate=${parsed.endDate}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch daily sales");
        }
        onNewReportData(data, null, parsed.startDate, parsed.endDate);
      } catch (err: unknown) {
        setError((err as Error).message || "An unknown error occurred");
        onNewReportData(
          null,
          (err as Error).message || "An unknown error occurred",
          parsed.startDate,
          parsed.endDate
        );
      } finally {
        setLoading(false);
      }
    } else {
      setError("No valid date range found in query.");
      setLoading(false);
      onNewReportData(null, "No valid date range found in query.");
    }
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">Ask POS</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="e.g., 'daily sales from 2025-01-01 to 2025-01-07' or 'daily sales last 7 days'"
          className="grow bg-gray-700 text-white p-2 rounded outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleQuerySubmit();
            }
          }}
          disabled={loading}
        />
        <button
          onClick={handleQuerySubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
          disabled={loading}
        >
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>
      {error && (
        <div className="mt-4 p-2 bg-red-600 text-white rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
