import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useLocation } from "react-router-dom";
import { useFormOptions } from "./FormOptionContext";

const Navbar = () => {
  const location = useLocation();
  const { selectedOptions } = useFormOptions();
  const [totalTests, setTotalTests] = useState(128); // Default value, will be updated from API

  // Future API call - uncomment when API is ready
  // useEffect(() => {
  //   const fetchTotalTests = async () => {
  //     try {
  //       const response = await fetch('/api/total-tests');
  //       const data = await response.json();
  //       setTotalTests(data.total);
  //     } catch (error) {
  //       console.error('Error fetching total tests:', error);
  //     }
  //   };
  //   fetchTotalTests();
  // }, []);

  // Determine the title based on the current route
  const getTitle = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname === "/all-tests") return "All Tests";
    if (location.pathname === "/new-test") return "New Test";
    return "All Tests"; // default
  };

  return (
    <nav className="flex justify-between items-center py-4 border-b border-gray-200 ">
      <div className="pl-4">
        <div className="text-lg font-medium text-black">{getTitle()}</div>
        {location.pathname === "/" && (
          <div className="text-sm text-gray-500 mt-1">
            Total tests performed: {totalTests}
          </div>
        )}
        {location.pathname === "/new-test" && selectedOptions.length > 0 && (
          <div className="text-sm text-gray-500 mt-1">
            Selected: {selectedOptions.join(", ")}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 pr-4">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} className="" />
          {/* <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </button>
        <button className="bg-washed-white hover:bg-gray-300 text-slate-900 py-2 px-4 rounded-lg flex items-center">
          <RiLogoutCircleLine className="mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

