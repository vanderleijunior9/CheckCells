import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, Info, List, Check } from "lucide-react";
import { fetchTestComments, updateTestComments } from "../services/api";

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
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [comments, setComments] = useState("");
  const [tempComments, setTempComments] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [savingComments, setSavingComments] = useState(false);

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

  // Fetch comments when testData is available
  useEffect(() => {
    const loadComments = async () => {
      if (testData?.testId) {
        try {
          setLoadingComments(true);
          console.log("Loading comments for test:", testData.testId);
          const fetchedComments = await fetchTestComments(testData.testId);

          const defaultComments = "Defaut comment -- api not working";
          setComments(fetchedComments || defaultComments);
          setTempComments(fetchedComments || defaultComments);
        } catch (error) {
          console.error("Failed to load comments:", error);
          const defaultComments =
            "The semen sample was meticulously collected on May 15, 2025, at the CC Lab, where it will undergo thorough analysis to ensure accurate results and provide valuable insights.";
          setComments(defaultComments);
          setTempComments(defaultComments);
        } finally {
          setLoadingComments(false);
        }
      }
    };

    loadComments();
  }, [testData]);

  // If no test data, redirect back
  if (!testData) {
    return null;
  }

  const handleBack = () => {
    navigate("/all-tests");
  };

  const handleEditClick = () => {
    setIsEditingComments(true);
    setTempComments(comments);
  };

  const handleSaveComments = async () => {
    if (!testData?.testId) return;

    try {
      setSavingComments(true);
      await updateTestComments(testData.testId, tempComments);
      setComments(tempComments);
      setIsEditingComments(false);
    } catch (error) {
      console.error("Failed to save comments:", error);
      alert("Failed to save comments. Please try again.");
    } finally {
      setSavingComments(false);
    }
  };

  const handleCancelEdit = () => {
    setTempComments(comments);
    setIsEditingComments(false);
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
                <span className="text-base text-gray-900">
                  {testData.status}
                </span>
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
                  {loadingComments ? (
                    <p className="text-gray-400 text-base italic">
                      Loading comments...
                    </p>
                  ) : isEditingComments ? (
                    <div className="space-y-3">
                      <textarea
                        value={tempComments}
                        onChange={(e) => setTempComments(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-check text-[#0c0c0d] text-base resize-none"
                        rows={4}
                        placeholder="Enter additional comments..."
                        disabled={savingComments}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveComments}
                          disabled={savingComments}
                          className="bg-green-check text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingComments ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingComments}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#0c0c0d] text-base">{comments}</p>
                  )}
                </div>
                {!isEditingComments && (
                  <button
                    onClick={handleEditClick}
                    className="text-[#353b40] underline ml-4 hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Download Button */}
            <div>
              <button className="bg-[#027b5d] text-[#eefffb] px-4 py-2 rounded-lg">
                Download Results
              </button>
            </div>

            {/* Test Results Details */}
            <button className="flex justify-left items-center gap-2 text-[#0c0c0d] text-base border border-gray-300 rounded-lg px-4 py-2">
              more details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;
