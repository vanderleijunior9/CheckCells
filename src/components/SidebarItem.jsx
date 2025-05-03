export function SidebarItem({ icon, text, active = false, alert = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
        active ? "bg-gray-200" : "hover:bg-gray-100"
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
      <span className={`${active ? "font-medium text-black" : "text-gray-700"}`}>
        {text}
      </span>
    </div>
  );
}
