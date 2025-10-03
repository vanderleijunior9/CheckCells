import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { HousePlus, Settings, Package, FileSpreadsheet } from "lucide-react";
import TableComponent from "./components/table/TableComponent";
import Navbar from "./components/Navbar";
import { Newtestpage } from "./components/Newtestpage";
import StartedTestPage from "./components/StartedTestPage";
import Dashboard from "./components/Dashboard";
import CameraView from "./components/CameraView";
import TestDetails from "./components/TestDetails";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen flex-col">
        <div className="flex flex-1 bg-washed-white">
          <Sidebar />
          <main className="flex-1 p-6 bg-white rounded-tl-3xl overflow-y-auto mt-8 ">
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/all-tests" element={<TableComponent />} />
              <Route path="/new-test" element={<Newtestpage />} />
              <Route path="/started-test" element={<StartedTestPage />} />
              <Route path="/camera-view" element={<CameraView />} />
              <Route path="/test-details" element={<TestDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
