import Sidebar, { SidebarItem } from "./components/Sidebar"
import { HousePlus, Settings, Package, FileSpreadsheet } from "lucide-react"
import TableComponent from './components/table/TableComponent.jsx';

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarItem icon={<HousePlus size={20} />} text="Dashboard"  />
        <SidebarItem icon={<FileSpreadsheet size={20} />} text="All Tests" />
        <SidebarItem icon={<Package size={20} />} text ="Order Slides" />
      </Sidebar>

      <main className="flex-1 p-6 bg-white overflow-y-auto">
        <h1 className="text-black text-2xl font-bold mb-4">All Tests</h1>
        <TableComponent />
      </main>
    </div>
  )
}
