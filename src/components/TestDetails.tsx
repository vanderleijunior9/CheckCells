import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, Info, List, Check } from "lucide-react";

interface TestData {
  diagnosticianName: string;
  testId: string;
  dateOfTest: string;
  testType: string;
  status: string;
}

interface TestResult {
  name: string;
  result: string;
  unit: string;
  normalRange: string;
  status: "normal" | "low" | "high";
  position: number;
}

const TestDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

 

  useEffect(() => {
    // Try to get test data from sessionStorage first, then from location.state
    const storedData = sessionStorage.getItem("testDetails");
    if (storedData) {
      setTestData(JSON.parse(storedData));
      // Clear the sessionStorage after reading
      sessionStorage.removeItem("testDetails");
    } else {
      const locationData = location.state as TestData;
      if (locationData) {
        setTestData(locationData);
      } else {
        navigate("/all-tests");
      }
    }
  }, [location.state, navigate]);

  // If no test data, redirect back
  if (!testData) {
    return null;
  }

  const handleBack = () => {
    navigate("/all-tests");
  };



  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-washed-white p-8 rounded-lg">
          <div className="flex flex-col gap-12">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-[#0c0c0d] mb-2">
                  Semen Test Results
                </h1>
                <p className="text-[#353b40] text-lg">2 Nov 2025, 4:03pm</p>
              </div>
              <div className="bg-white px-3 py-2 rounded-lg">
                <span className="text-base text-gray-900">{testData.status}</span>
              </div>
            </div>

            {/* Test Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className=" p-6 rounded-lg">
                <p className="text-[#353b40] text-base mb-2">
                  Laboratory Scientist
                </p>
                <p className="text-black text-base">
                  {testData.diagnosticianName}
                </p>
              </div>
              <div className=" p-6 rounded-lg">
                <p className="text-gray-800 text-base mb-2">Test ID</p>
                <p className="text-black text-base">{testData.testId}</p>
              </div>
              <div className=" p-6 rounded-lg">
                <p className="text-gray-800 text-base mb-2">
                  Sexual abstinence interval
                </p>
                <p className="text-black text-base">2 days</p>
              </div>
              <div className=" p-6 rounded-lg">
                <p className="text-gray-800 text-base mb-2">Test Type</p>
                <p className="text-black text-base">{testData.testType}</p>
              </div>
            </div>

            {/* Additional Comments */}
            <div className="bg-white p-6 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-[#353b40] text-base mb-2">
                    Additional comments
                  </p>
                  <p className="text-[#0c0c0d] text-base">
                    The semen sample was meticulously collected on May 15, 2025,
                    at the CC Lab, where it will undergo thorough analysis to
                    ensure accurate results and provide valuable insights.
                  </p>
                </div>
                <button className="text-[#353b40] underline ml-4">Edit</button>
              </div>
            </div>

            {/* Download Button */}
            <div>
              <button className="bg-[#027b5d] text-[#eefffb] px-4 py-2 rounded-lg">
                Download Results
              </button>
            </div>

            {/* Test Results Details */}
            <button className="flex justify-left items-center gap-2 text-[#0c0c0d] text-base border border-gray-300 rounded-lg px-4 py-2"
            >
              more details
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;
