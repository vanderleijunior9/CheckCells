import React, { useState } from "react";
import { Home, FileText, Box, HelpCircle, MessageSquare, Settings } from "lucide-react";
import logoImage from "../assets/logo.avif"; // Import the logo image

const Logo = () => (
  <div className="flex items-left gap-2 pl-2 pr-20 pt-5 pb-8">
    <img 
      src={logoImage} 
      alt="CheckCells Logo" 
      className="" 
    />
  </div>
);

// Sidebar item component
export function SidebarItem({ icon, text, active = false, alert = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
        active 
          ? "bg-gray-100 text-black" 
          : "hover:bg-gray-100"
      }`}
    >
      <div className="relative">
        <div className={`${active ? "text-[#02B191]" : "text-gray-500"}`}>
          {icon}
        </div>
        {alert && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
      <span className={`${active ? "font-medium" : "text-gray-700"}`}>
        {text}
      </span>
    </div>
  );
}

// Sidebar item bottom component
export function SidebarItemBottom({ icon, text, active = false, alert = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
        active 
          ? "bg-gray-100 text-black" 
          : "hover:bg-gray-200"
      }`}
    >
      <div className="relative">
        <div className={`text-sm ${active ? "text-[#02B191]" : "text-gray-500"}`}>
          {icon}
        </div>
        {alert && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
      <span className={`text-sm ${active ? "font-medium" : "text-gray-700"}`}>
        {text}
      </span>
    </div>
  );
}

// Action button component now styled like SidebarItemBottom
const ActionButton = ({ icon, label, onClick, active = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors hover:bg-grey-300 ${
        active 
          ? "bg-green text-white" 
          : "hover:bg-gray-200"
      }`}
    >
      <div className="relative">
        <div className={`text-sm ${active ? "text-white" : "text-gray-500"}`}>
          {icon}
        </div>
      </div>
      <span className={`text-sm ${active ? "font-medium" : "text-gray-700"}`}>
        {label}
      </span>
    </div>
  );
};

// Section label component
const SectionLabel = ({ label }) => (
  <div className="px-4 py-2 text-xs uppercase text-gray-400 font-medium">
    {label}
  </div>
);

// Simple Plus icon component
function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Main sidebar component
export default function Sidebar({ children }) {
  const [activeItem, setActiveItem] = useState(null);

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  return (
    <div className="w-[250px] h-dvh bg-gray-50 border-r border-slate-100 flex flex-col shadow-lg">
      <Logo />
      
      <div className="px-2 space-y-1">
        <ActionButton 
          label="New Semen Test" 
          icon={<PlusIcon />} 
          onClick={() => handleItemClick("New Semen Test")}
          active={activeItem === "New Semen Test"}
        />
        <ActionButton 
          label="New Quality Control Test" 
          icon={<PlusIcon />} 
          onClick={() => handleItemClick("New Quality Control Test")}
          active={activeItem === "New Quality Control Test"}
        />
      </div>
      
      <SectionLabel label="Main Menu" />
      
      <div className="px-2 space-y-1 flex-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              active: activeItem === child.props.text,
              onClick: () => handleItemClick(child.props.text),
            });
          }
          return child;
        })}
      </div>
      
      <SectionLabel label="Managment" />
      <div className="px-2 space-y-1">
        <SidebarItemBottom 
          icon={<HelpCircle size={20} />} 
          text="Help" 
          active={activeItem === "Help"} 
          onClick={() => handleItemClick("Help")} 
        />
        <SidebarItemBottom 
          icon={<MessageSquare size={20} />} 
          text="Support" 
          active={activeItem === "Support"} 
          onClick={() => handleItemClick("Support")} 
        />
        <SidebarItemBottom 
          icon={<Settings size={20} />} 
          text="Settings" 
          active={activeItem === "Settings"} 
          onClick={() => handleItemClick("Settings")} 
        />
      </div>

      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="text-xs text-gray-400">CheckCells Version 8</div>
        <div className="text-xs text-gray-400">Last Calibration: 4/15/2023 16:23:02</div>
      </div>
    </div>
  );
}
