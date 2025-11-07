import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  HousePlus,
  Package,
  Trello,
  List,
} from "lucide-react";
import logoImage from "../assets/logo.avif";
import { useNavigate } from "react-router-dom";
import { useFormOptions } from "./FormOptionContext";

const Logo = () => (
  <div className="flex items-left gap-2 pl-5 pr-20 pt-5 pb-7 ">
    <img src={logoImage} alt="CheckCells Logo" className="" />
  </div>
);

// Sidebar item component
export function SidebarItem({
  icon,
  text,
  active = false,
  alert = false,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
        active ? " text-gray-400 border shadow-lg" : "hover:bg-gray-100"
      }`}
    >
      <div className="relative">
        <div className={`${active ? "text-gray-700" : "text-gray-500"}`}>
          {icon}
        </div>
        {alert && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </div>
      <span
        className={`text-lg ${
          active ? "font-medium text-black" : "text-gray-700"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

// Action button component
const ActionButton = ({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
        active ? "bg-green-check text-white" : "hover:bg-gray-200"
      }`}
    >
      <div className="relative">
        <div className={`text-sm ${active ? "text-white" : "text-gray-500"}`}>
          {icon}
        </div>
      </div>
      <span className={`text-lg ${active ? "font-medium" : "text-gray-700"}`}>
        {label}
      </span>
    </div>
  );
};

// Section label
const SectionLabel = ({ label }: { label: string }) => (
  <div className="px-4 py-2 text-xs uppercase text-gray-400 font-medium">
    {label}
  </div>
);

// Plus icon
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "w-5 h-5"}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Main sidebar
export default function Sidebar() {
  const { selectedOptions, setSelectedOptions } = useFormOptions();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    if (item === "Dashboard") navigate("/");
    if (item === "All Tests") navigate("/all-tests");
    if (item === "New Semen Test") {
      setShowDropdown(!showDropdown);
      navigate("/new-test");
    } else {
      setShowDropdown(false);
    }
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="w-[320px] bg-washed-grey border-r border-slate-100 flex flex-col ">
      <Logo className="w-full" />

      <div className="px-2 space-y-1">
        <ActionButton
          label="New Semen Test"
          icon={showDropdown ? <ChevronDown /> : <ChevronRight />}
          onClick={() => handleItemClick("New Semen Test")}
          active={activeItem === "New Semen Test"}
        />

        {showDropdown && activeItem === "New Semen Test" && (
          <div className="mt-4 space-y-2 bg-washed-grey p-3">
            {["All Parameters", "Plain Sample", "Vitality", "pH Test"].map(
              (option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 text-lg text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="form-checkbox text-green-check"
                  />
                  {option}
                </label>
              )
            )}
          </div>
        )}

        <ActionButton
          label="New Quality Control Test"
          icon={<PlusIcon />}
          onClick={() => handleItemClick("New Quality Control Test")}
          active={activeItem === "New Quality Control Test"}
        />
      </div>

      <hr className="solid" />
      <div className="px-2 space-y-1 flex-1">
        <SidebarItem
          icon={<HousePlus size={20} />}
          text="Dashboard"
          active={activeItem === "Dashboard"}
          onClick={() => handleItemClick("Dashboard")}
        />
        <SidebarItem
          icon={<List size={20} />}
          text="All Tests"
          active={activeItem === "All Tests"}
          onClick={() => handleItemClick("All Tests")}
        />
        {/* <SidebarItem
          icon={<Package size={20} />}
          text="Buy Tests"
          active={activeItem === "Buy Tests"}
          onClick={() => handleItemClick("Buy Tests")}
        /> */}
        <hr className="solid" />
        <SidebarItem
          icon={<Trello size={20} />}
          text="Instruction of Use"
          active={activeItem === "Instruction of Use"}
          onClick={() => handleItemClick("Instruction of Use")}
        />
      </div>

      <SectionLabel label="Checkcells version x" />
      <SectionLabel label="Last Calibration: 4/15/2025 16:23:02" />
    </div>
  );
}
