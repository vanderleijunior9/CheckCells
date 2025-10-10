import React, { useState, useEffect } from "react";
import { useFormOptions } from "./FormOptionContext";
import {
  Loader,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { fetchTestData, TestData as ApiTestData } from "../services/api";

const Dashboard = () => {
  const { selectedOptions } = useFormOptions();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [testData, setTestData] = useState<ApiTestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Fetch test data from API
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        const data = await fetchTestData();
        setTestData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load test data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, []);

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

  // Pagination calculations
  const totalPages = Math.ceil(testData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = testData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader
                        size={20}
                        className="mr-2 animate-spin text-green-check"
                      />
                      <span className="text-gray-600">Loading tests...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : (
                currentData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">
                      {row.diagnosticianName}
                    </td>
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
                          <CircleCheck
                            size={12}
                            className="mr-1 text-green-600"
                          />
                          {row.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, testData.length)} of{" "}
            {testData.length} results
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-500"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-green-check text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
