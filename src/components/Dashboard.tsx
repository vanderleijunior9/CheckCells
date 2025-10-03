import React, { useState } from "react";
import { useFormOptions } from "./FormOptionContext";
import {
  Loader,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import testData from "../data/testData.json";

const Dashboard = () => {
  const { selectedOptions } = useFormOptions();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Calendar data
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Get dates for the selected week
  const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday + weekOffset * 7);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const dayAbbreviations = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekOffset(0);
  };

  // Get month and year for display
  const displayDate = weekDates[3]; // Wednesday of the week
  const displayMonth = displayDate.toLocaleString("default", { month: "long" });
  const displayYear = displayDate.getFullYear();

  return (
    <div className="m">
      {/* Calendar and Empty Box Section */}
      <div className="flex gap-6 my-8">
        {/* Calendar - 1/3 width */}
        <div className="w-1/3">
          <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
              <div className="text-sm text-gray-500">{currentTime}</div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousWeek}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft size={16} className="text-gray-700" />
              </button>
              <div className="text-xl font-semibold text-gray-900">
                {displayMonth} {displayYear}
              </div>
              <button
                onClick={goToNextWeek}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight size={16} className="text-gray-700" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => {
                const isCurrentDay =
                  date.toDateString() === currentDate.toDateString();
                const dayAbbr = dayAbbreviations[index];
                const dayNumber = date.getDate();

                return (
                  <div
                    key={index}
                    className={`p-2 text-center rounded-lg cursor-pointer transition-colors ${
                      isCurrentDay
                        ? "bg-green-check text-white font-semibold"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">{dayAbbr}</div>
                    <div className="text-sm">{dayNumber}</div>
                  </div>
                );
              })}
            </div>
            {currentWeekOffset !== 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={goToCurrentWeek}
                  className="text-sm text-green-check hover:text-green-700 font-medium"
                >
                  Back to Current Week
                </button>
              </div>
            )}
            <div className="mt-4 text-center"></div>
          </div>
        </div>

        {/* Empty Box - 2/3 width */}
        <div className="w-2/3">
          <div className="bg-white rounded-2xl shadow p-6 border border-slate-100 h-full flex items-center justify-center">
            <span className="text-gray-400 text-lg">Empty Box</span>
          </div>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="bg-white rounded-2xl shadow p-6 border border-slate-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Tests
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left text-gray-600 font-medium">
                  Scientist
                </th>
                <th className="py-2 px-3 text-left text-gray-600 font-medium">
                  Test ID
                </th>
                <th className="py-2 px-3 text-left text-gray-600 font-medium">
                  Type
                </th>
                <th className="py-2 px-3 text-left text-gray-600 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
  {testData.slice(0, 10).map((row, index) => (
    <tr key={index} className="border-b border-gray-100">
      <td className="py-2 px-3 text-gray-700">{row.diagnosticianName}</td>
      <td className="py-2 px-3 text-gray-700">{row.testId}</td>
      <td className="py-2 px-3 text-gray-700">{row.testType}</td>
      <td className="py-2 px-3">
        {row.status === "Analyzing" ? (
          <span className="flex items-center text-xs text-gray-700">
            <Loader size={12} className="mr-1 text-blue-600" />
            {row.status}
          </span>
        ) : (
          <span className="flex items-center text-xs text-gray-700">
            <CircleCheck size={12} className="mr-1 text-green-600" />
            {row.status}
          </span>
        )}
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

