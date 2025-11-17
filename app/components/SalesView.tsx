"use client";

import { useState, useEffect, useRef } from "react";
import SalesChart from "./SalesChart";
import AskPos from "./AskPos";
import { DailySale } from "../interfaces/DailySale";
import { ShowAlert } from "./ShowAlert";

export default function SalesView() {
  const [dailySalesData, setDailySalesData] = useState<DailySale[]>([]);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  const [manualStartDate, setManualStartDate] = useState("2025-11-10");
  const [manualEndDate, setManualEndDate] = useState("2025-11-18");

  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchSales = async (startDate: string, endDate: string) => {
      try {
        const res = await fetch(
          `/api/daily-sales?startDate=${startDate}&endDate=${endDate}`
        );
        const data: DailySale[] = await res.json();

        if (!res.ok) {
          ShowAlert("Failed to fetch daily sales", "error", "center");
        }

        setDailySalesData(data);

        if (data.length > 0) {
          setReportStartDate(data[0].date);
          setReportEndDate(data[data.length - 1].date);
        } else {
          setReportStartDate(startDate);
          setReportEndDate(endDate);
        }
      } catch (err: unknown) {
        console.log(err);
        setDailySalesData([]);
        setReportStartDate(startDate);
        setReportEndDate(endDate);
      }
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchSales(manualStartDate, manualEndDate).finally(() => {
        setLoadingInitialData(false);
      });
    } else if (manualStartDate && manualEndDate) {
      fetchSales(manualStartDate, manualEndDate);
    }
  }, [manualStartDate, manualEndDate]);

  const handleAskPosReportData = (
    data: DailySale[] | null,
    error: string | null,
    queryStartDate?: string,
    queryEndDate?: string
  ) => {
    if (error) {
      setDailySalesData([]);
      setReportStartDate("");
      setReportEndDate("");
    } else if (data) {
      setDailySalesData(data);

      if (data.length > 0) {
        setReportStartDate(data[0].date);
        setReportEndDate(data[data.length - 1].date);
      } else if (queryStartDate && queryEndDate) {
        setReportStartDate(queryStartDate);
        setReportEndDate(queryEndDate);
      } else {
        setReportStartDate("");
        setReportEndDate("");
      }
    }
  };

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "startDate") {
      setManualStartDate(e.target.value);
    } else {
      setManualEndDate(e.target.value);
    }
  };

  if (loadingInitialData) {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Sales Reporting</h2>
        <p>Loading initial sales data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Sales Reporting</h2>
      <AskPos onNewReportData={handleAskPosReportData} />

      <div className="flex mb-4 space-x-4 mt-4">
        <div>
          <label htmlFor="startDate" className="text-white mr-2">
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            value={manualStartDate}
            onChange={handleManualDateChange}
            className="p-2 rounded bg-gray-600 text-white"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="text-white mr-2">
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            value={manualEndDate}
            onChange={handleManualDateChange}
            className="p-2 rounded bg-gray-600 text-white"
          />
        </div>
      </div>

      <SalesChart
        salesData={dailySalesData}
        startDate={reportStartDate}
        endDate={reportEndDate}
      />
    </div>
  );
}
