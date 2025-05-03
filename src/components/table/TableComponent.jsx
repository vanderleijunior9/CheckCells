import React from 'react';
import { Loader, CircleCheck, Search} from "lucide-react"

const data = [
  { diagnosticianName: 'Sarah Brown', testId: '<ID>', dateOfTest: '2 Nov 2025, 4:03pm', testType: 'pH', status: 'Analyzing' },
  { diagnosticianName: 'Sarah Yellow', testId: '<ID>', dateOfTest: '2 Nov 2025, 4:03pm', testType: 'Vitality', status: 'Complete' },
  { diagnosticianName: 'Micheal Owen', testId: '<ID>', dateOfTest: '2 Nov 2025, 4:03pm', testType: 'All parameters', status: 'Complete' },
  { diagnosticianName: 'Chris Hero', testId: '<ID>', dateOfTest: '2 Nov 2025, 4:03pm', testType: 'pH + Vitality', status: 'Analyzing' },
];

const TableComponent = () => {
  return (
    <div className="p-4 mt-8 bg-washed-whitewhite border shadow-xl rounded-2xl">
      <div className="flex justify-between items mb-4">
        <div className=" relative flex items-center">
          <input
            type="text"
            placeholder="Value"
            className="w-full pl-3 pr-4 py-2 border text-sm h-[.3in] border-gray-300 focus:outline-none rounded-lg focus:ring-1 focus:ring-black text-black "
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search size={14} className="text-gray-500" />
          </div>
        </div>
        <select value="option1" className="ml-8 pl-1 pr-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black text-slate-500 ">
          <option value="" className="text-black">Pick an option</option>
          <option value="" className="text-black">Option 1</option>
          <option value="option2" className="text-black">Option 2</option>
        </select>

      </div>

      <table className="w-full border-collapse text-black rounded-md">
        <thead className="bg-washed-grey rounded-md">
        <tr className="bg-washed-grey">
          <th className="py-2 px-4 text-left bg-washed-grey">Diagnostician Name</th>
          <th className="py-2 px-4 text-left bg-washed-grey">Test ID</th>
          <th className="py-2 px-4 text-left bg-washed-grey">Date of Test</th>
          <th className="py-2 px-4 text-left bg-washed-grey">Test Type</th>
          <th className="py-2 px-4 text-left rounded-tr-2xl bg-washed-grey">Status</th>
        </tr>
        </thead>  
        <tbody>
  {data.map((row, index) => (
    <tr key={index} className="even:bg-gray-50">
      <td className="py-2 px-4 text-sm">{row.diagnosticianName}</td>
      <td className="py-2 px-4 text-sm">{row.testId}</td>
      <td className="py-2 px-4 text-sm">{row.dateOfTest}</td>
      <td className="py-2 px-4 text-sm">{row.testType}</td>
      <td className="py-2 px-4">
        {row.status === 'Analyzing' ? (
          <span className="flex items-center text-sm">
            <Loader size={17} className="mr-3 text-blue-500" />
            {row.status}
          </span>
        ) : (
          <span className=" flex items-center text-sm">
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
