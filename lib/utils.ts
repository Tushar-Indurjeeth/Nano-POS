interface ParsedQuery {
  startDate?: string;
  endDate?: string;
  error?: string;
}

export function parseQuery(query: string): ParsedQuery {
  const today = new Date();
  const yyyy_mm_dd = (date: Date) => date.toISOString().split("T")[0];

  // Pattern 1: "daily sales from YYYY-MM-DD to YYYY-MM-DD"
  const dateRangeMatch = query.match(
    /daily sales from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/
  );

  if (dateRangeMatch) {
    const [, startDate, endDate] = dateRangeMatch;
    return { startDate, endDate };
  }

  // Pattern 2: "daily sales last N days"
  const lastNDaysMatch = query.match(/daily sales last (\d+) days/);
  if (lastNDaysMatch) {
    const n = parseInt(lastNDaysMatch[1], 10);
    if (isNaN(n) || n <= 0) {
      return { error: "Invalid number of days for 'last N days' query." };
    }

    const endDate = today;
    const startDate = new Date();
    startDate.setDate(today.getDate() - n + 1);
    return { startDate: yyyy_mm_dd(startDate), endDate: yyyy_mm_dd(endDate) };
  }

  // Pattern 3: "daily sales for YYYY-MM-DD"
  const specificDayMatch = query.match(/daily sales for (\d{4}-\d{2}-\d{2})/);
  if (specificDayMatch) {
    const [, date] = specificDayMatch;
    return { startDate: date, endDate: date };
  }

  return {
    error:
      "Could not parse query. Please use formats like 'daily sales from YYYY-MM-DD to YYYY-MM-DD', 'daily sales last N days', or 'daily sales for YYYY-MM-DD'.",
  };
}
