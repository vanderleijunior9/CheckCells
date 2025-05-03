import Sidebar, { SidebarItem } from "./components/Sidebar"
import { HousePlus, Settings, Package, FileSpreadsheet } from "lucide-react"
import TableComponent from './components/table/TableComponent.jsx';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div className="flex h-screen flex-col">
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          
          <SidebarItem icon={<HousePlus size={20} />} text="Dashboard"  />
          <SidebarItem icon={<FileSpreadsheet size={20} />} text="All Tests" />
          <SidebarItem icon={<Package size={20} />} text ="Order Slides" />
        </Sidebar>

        <main className="flex-1 p-6 bg-white overflow-y-auto">
          <Navbar />
          <TableComponent />
        </main>
      </div>
    </div>
  )
}
