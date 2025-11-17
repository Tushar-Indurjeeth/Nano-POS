import { DailySale } from "./DailySale";

export interface AskPosProps {
  onNewReportData: (
    data: DailySale[] | null,
    error: string | null,
    startDate?: string,
    endDate?: string
  ) => void;
}
