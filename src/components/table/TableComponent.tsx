import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, CircleCheck, Search } from "lucide-react";
import testData from "../../data/testData.json";

interface TestData {
  diagnosticianName: string;
  testId: string;
  dateOfTest: string;
  testType: string;
  status: string;
}

const TableComponent = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [search, setSearch] = useState("");

  // Filter data based on search and selectedOption
  const filteredData = testData.filter((row: TestData) => {
    const matchesSearch =
      row.diagnosticianName.toLowerCase().includes(search.toLowerCase()) ||
      row.testId.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedOption ? row.testType === selectedOption : true;
    return matchesSearch && matchesType;
  });

  const handleRowClick = (testData: TestData) => {
    // Navigate to test details in the same tab
    navigate("/test-details", { state: testData });
  };

  return (
    <div className="p-4 mt-8 bg-washed-white border shadow-xl rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="relative flex items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Test ID or Scientist"
            className="w-full sm:w-[260px] pl-3 pr-4 py-2 border text-sm h-[.3in] border-gray-300 focus:outline-none rounded-lg focus:ring-1 focus:ring-black text-black "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search size={14} className="text-gray-500" />
          </div>
        </div>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="sm:ml-8 pl-1 pr-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black text-slate-500 w-full sm:w-auto"
        >
          <option value="" className="text-black">
            Filter by Type
          </option>
          <option value="pH" className="text-black">
            pH
          </option>
          <option value="Vitality" className="text-black">
            Vitality
          </option>
          <option value="All parameters" className="text-black">
            All parameters
          </option>
          <option value="Motility" className="text-black">
            Motility
          </option>
          <option value="Morphology" className="text-black">
            Morphology
          </option>
          <option value="Concentration" className="text-black">
            Concentration
          </option>
        </select>
      </div>

      <table className="w-full border-collapse text-black rounded-md">
        <thead className="bg-washed-grey rounded-md">
          <tr className="bg-washed-grey">
            <th className="py-2 px-4 text-left bg-washed-grey">
              Lab Scientist
            </th>
            <th className="py-2 px-4 text-left bg-washed-grey">Test ID</th>
            <th className="py-2 px-4 text-left bg-washed-grey">Date of Test</th>
            <th className="py-2 px-4 text-left bg-washed-grey">Test Type</th>
            <th className="py-2 px-4 text-left rounded-tr-2xl bg-washed-grey">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row: TestData, index: number) => (
            <tr
              key={index}
              className="even:bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleRowClick(row)}
            >
              <td className="py-2 px-4 text-sm">{row.diagnosticianName}</td>
              <td className="py-2 px-4 text-sm">{row.testId}</td>
              <td className="py-2 px-4 text-sm">{row.dateOfTest}</td>
              <td className="py-2 px-4 text-sm">{row.testType}</td>
              <td className="py-2 px-4">
                {row.status === "Analyzing" ? (
                  <span className="flex items-center text-sm">
                    <Loader size={17} className="mr-3 text-blue-500" />
                    {row.status}
                  </span>
                ) : (
                  <span className="flex items-center text-sm">
                    <CircleCheck size={18} className="mr-3 text-green-500" />
                    {row.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
