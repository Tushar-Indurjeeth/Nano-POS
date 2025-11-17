import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { DailySale } from "../interfaces/DailySale";

interface SalesChartProps {
  salesData: DailySale[];
  startDate: string;
  endDate: string;
}

export default function SalesChart({ salesData }: SalesChartProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h2 className="text-white text-xl mb-4">Daily Sales Report</h2>

      {salesData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={salesData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis
              dataKey="date"
              stroke="#cbd5e0"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return `${date.getMonth() + 1}-${date.getDate()}`;
              }}
            />
            <YAxis stroke="#cbd5e0" />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", border: "none" }}
              formatter={(value: number, name: string) => {
                if (name === "Total Sales") {
                  return [`R${value}`, name];
                }
                return [`${value}`, name];
              }}
              labelFormatter={(label: string) => {
                const date = new Date(label);
                return date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              }}
            />
            <Legend />
            <Bar dataKey="total_sales" fill="#8884d8" name="Total Sales" />
            <Bar dataKey="num_sales" fill="#82ca9d" name="Number of Sales" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-white">
          No sales data available for the selected date range.
        </p>
      )}
    </div>
  );
}
