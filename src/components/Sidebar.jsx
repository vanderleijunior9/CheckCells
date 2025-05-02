// components/Sidebar.jsx
import React from "react";
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



// SidebarItem component that matches your App.jsx usage
export function SidebarItem({ icon, text, active = false, alert = false }) {
  return (
    <div 
      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
        active 
          ? "bg-gray-100" 
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

// Main sidebar component
export default function Sidebar({ children }) {
  return (
    <div className="w-[250px] h-dvh bg-gray-50 border-r border-gray-200 flex flex-col">
      <Logo />
      
      <div className="mt-2 px-2 space-y-2">
        <ActionButton 
          label="New Semen Test" 
          icon={<PlusIcon className="w-4 h-4" />} 
          primary 
        />
        <ActionButton 
          label="New Quality Control Test" 
          icon={<PlusIcon className="w-4 h-4" />} 
        />
      </div>
      
      <SectionLabel label="Main Menu" />
      
      <div className="px-2 space-y-1 flex-1">
        {children}
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="text-xs text-gray-400">CheckCells Version 8</div>
        <div className="text-xs text-gray-400">Last Calibration: 4/15/2023 16:23:02</div>
      </div>
    </div>
  );
}

// Section label component
const SectionLabel = ({ label }) => (
  <div className="px-4 py-2 text-xs uppercase text-gray-400 font-medium">
    {label}
  </div>
);

// Action button component for tests
const ActionButton = ({ label, icon, primary = false }) => (
  <button 
    className={`flex items-center gap-2 w-full rounded-lg px-4 py-3 text-sm transition-colors ${
      primary 
        ? "bg-[#02B191] text-white hover:bg-[#02B191]/90" 
        : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Simple Plus icon component
function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
