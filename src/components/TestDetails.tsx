import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronUp,
  Info,
  List,
  Check,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight,
} from "lucide-react";
import { fetchTestComments, updateTestComments } from "../services/api";

interface TestData {
  diagnosticianName: string;
  testId: string;
  dateOfTest: string;
  testType: string;
  status: string;
  volume?: number;
  days?: number;
  delution?: number;
}

// interface TestResult {
//   name: string;
//   result: string;
//   unit: string;
//   normalRange: string;
//   status: "normal" | "low" | "high";
//   position: number;
// }

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
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Fetch full test details from API
  useEffect(() => {
    const loadFullDetails = async () => {
      if (testData?.testId) {
        try {
          setLoadingDetails(true);
          const testIdStr = String(testData.testId);
          let id = testIdStr;

          if (testIdStr.startsWith("TEST-")) {
            id = testIdStr.replace("TEST-", "").replace(/^0+/, "") || "1";
          } else if (testIdStr.startsWith("TST-")) {
            id = testIdStr.replace("TST-", "").replace(/^0+/, "") || "1";
          }

          const response = await fetch(
            `https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters/${id}`
          );

          if (response.ok) {
            const fullData = await response.json();
            setTestData((prev) => ({
              ...prev!,
              volume: fullData.volume,
              days: fullData.days,
              delution: fullData.delution,
            }));

            // Check if video exists and parse frames
            if (fullData.video) {
              try {
                const videoData = JSON.parse(fullData.video);
                if (videoData.frames && Array.isArray(videoData.frames)) {
                  setVideoFrames(videoData.frames);
                }
              } catch (e) {
                console.error("Failed to parse video data:", e);
              }
            }
          }
        } catch (error) {
          console.error("Failed to load full test details:", error);
        } finally {
          setLoadingDetails(false);
          setLoadingVideos(false);
        }
      }
    };

    loadFullDetails();
  }, [testData?.testId]);

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

  const handlePreviousFrame = () => {
    setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : videoFrames.length - 1));
    setIsPlaying(false);
  };

  const handleNextFrame = () => {
    setCurrentFrameIndex((prev) => (prev < videoFrames.length - 1 ? prev + 1 : 0));
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-advance frames when playing
  useEffect(() => {
    if (isPlaying && videoFrames.length > 0) {
      const interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev < videoFrames.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false); // Stop at end
            return prev;
          }
        });
      }, 500); // 2 FPS playback (500ms per frame)

      return () => clearInterval(interval);
    }
  }, [isPlaying, videoFrames.length]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-white">
                <p className="text-[#353b40] text-base mb-2">
                  Laboratory Scientist
                </p>
                <p className="text-black text-base">
                  {loadingDetails ? "Loading..." : testData.diagnosticianName}
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white">
                <p className="text-gray-800 text-base mb-2">Test ID</p>
                <p className="text-black text-base">
                  {loadingDetails ? "Loading..." : testData.testId}
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white">
                <p className="text-gray-800 text-base mb-2">Volume</p>
                <p className="text-black text-base">
                  {loadingDetails
                    ? "Loading..."
                    : `${testData.volume || "N/A"} mL`}
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white">
                <p className="text-gray-800 text-base mb-2">
                  Days Since Ejaculation
                </p>
                <p className="text-black text-base">
                  {loadingDetails
                    ? "Loading..."
                    : `${testData.days || "N/A"} days`}
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white">
                <p className="text-gray-800 text-base mb-2">Dilution</p>
                <p className="text-black text-base">
                  {loadingDetails ? "Loading..." : testData.delution || "N/A"}
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white">
                <p className="text-gray-800 text-base mb-2">Test Type</p>
                <p className="text-black text-base">
                  {loadingDetails ? "Loading..." : testData.testType}
                </p>
              </div>
            </div>

            {/* Video Slideshow */}
            {videoFrames.length > 0 && (
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recorded Video
                </h2>
                {loadingVideos ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="text-gray-400">Loading video...</span>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Frame Display */}
                    <div className="relative w-full rounded-lg bg-black overflow-hidden">
                      <img
                        src={videoFrames[currentFrameIndex]}
                        alt={`Frame ${currentFrameIndex + 1}`}
                        className="w-full h-auto"
                        style={{ maxHeight: "400px", objectFit: "contain" }}
                      />
                      
                      {/* Play/Pause Overlay */}
                      <button
                        onClick={togglePlayPause}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all"
                      >
                        <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          {isPlaying ? (
                            <div className="flex gap-1">
                              <div className="w-2 h-6 bg-gray-800"></div>
                              <div className="w-2 h-6 bg-gray-800"></div>
                            </div>
                          ) : (
                            <div className="w-0 h-0 border-l-[12px] border-l-gray-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={handlePreviousFrame}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        <ChevronLeftIcon size={20} />
                        Previous
                      </button>

                      <div className="flex flex-col items-center gap-2">
                        <span className="text-gray-600">
                          Frame {currentFrameIndex + 1} / {videoFrames.length}
                        </span>
                        <button
                          onClick={togglePlayPause}
                          className="px-4 py-1 bg-green-check text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          {isPlaying ? "Pause" : "Play"}
                        </button>
                      </div>

                      <button
                        onClick={handleNextFrame}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        Next
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
