import React from "react";
import { Bell } from "lucide-react";
import { RiLogoutCircleLine } from "react-icons/ri";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-4 border-b border-gray-200 ">
      <div className="text-lg font-medium pl-4 text-black">All Tests</div>
      <div className="flex items-center gap-4 pr-4">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} className=""/>
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
