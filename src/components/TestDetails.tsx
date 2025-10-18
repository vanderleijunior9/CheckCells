import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight,
  Maximize,
  Play,
  Pause,
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
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [comments, setComments] = useState("");
  const [tempComments, setTempComments] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [savingComments, setSavingComments] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [videos, setVideos] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

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

  // Fetch test parameters/metadata from API
  useEffect(() => {
    const loadFullDetailsParameters = async () => {
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

          console.log(
            `🔍 Fetching test parameters for test ID: ${testIdStr} (API ID: ${id})`
          );

          // Fetch test details/parameters
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

            console.log("📄 Test parameters loaded:", {
              volume: fullData.volume,
              days: fullData.days,
              delution: fullData.delution,
            });
          } else {
            console.error("Failed to fetch test parameters:", response.status);
          }
        } catch (error) {
          console.error("Failed to load test parameters:", error);
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    loadFullDetailsParameters();
  }, [testData?.testId]);

  // Fetch videos from local server
  useEffect(() => {
    const loadVideoDetails = async () => {
      if (testData?.testId) {
        try {
          setLoadingVideos(true);
          const testIdStr = String(testData.testId);

          console.log(
            `🎥 Fetching videos from local server for test: ${testIdStr}`
          );

          const API_BASE_URL = "http://localhost:3001";
          const videosResponse = await fetch(
            `${API_BASE_URL}/api/upload/videos/${testIdStr}`
          );

          if (videosResponse.ok) {
            const videoData = await videosResponse.json();
            console.log(
              `📹 Found ${videoData.count} videos for test ${testIdStr}`
            );

            // Extract video URLs
            const videoUrls = videoData.videos.map((video: any) => video.url);

            console.log(
              `✅ Loaded ${videoUrls.length} video URLs from local server:`,
              videoUrls
            );

            if (videoUrls.length > 0) {
              setVideos(videoUrls);
            } else {
              console.log("⚠️ No videos found on local server for this test");
            }
          } else {
            console.error(
              "Failed to fetch videos from local server:",
              videosResponse.status
            );
          }
        } catch (error) {
          console.error("Failed to load video details:", error);
        } finally {
          setLoadingVideos(false);
        }
      }
    };

    loadVideoDetails();
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

  const handlePreviousVideo = () => {
    setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1));
    setIsPlaying(false);
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0));
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleVideoClick = (index: number) => {
    setCurrentVideoIndex(index);
    setIsPlaying(false);
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
            {videos.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Test Videos
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {videos.length} {videos.length === 1 ? "video" : "videos"}
                  </span>
                </div>

                {loadingVideos ? (
                  <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-check mx-auto mb-3"></div>
                      <span className="text-gray-500">Loading videos...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Main Video Player */}
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        src={videos[currentVideoIndex]}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: "500px" }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />

                      {/* Custom Controls Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlayPause}
                            className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full transition-all shadow-lg"
                            title={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? (
                              <Pause size={20} />
                            ) : (
                              <Play size={20} />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={toggleFullscreen}
                          className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full transition-all shadow-lg"
                          title="Fullscreen"
                        >
                          <Maximize size={20} />
                        </button>
                      </div>

                      {/* Video Counter Badge */}
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentVideoIndex + 1} / {videos.length}
                      </div>
                    </div>

                    {/* Navigation Controls */}
                    {videos.length > 1 && (
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={handlePreviousVideo}
                          disabled={currentVideoIndex === 0}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon size={20} />
                          Previous
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Video</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {currentVideoIndex + 1}
                          </span>
                          <span className="text-sm text-gray-500">of</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {videos.length}
                          </span>
                        </div>

                        <button
                          onClick={handleNextVideo}
                          disabled={currentVideoIndex === videos.length - 1}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-check hover:bg-teal-700 disabled:bg-gray-50 disabled:text-gray-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
                        >
                          Next
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}

                    {/* Video Thumbnails Grid */}
                    {videos.length > 1 && (
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          All Videos
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {videos.map((video, index) => (
                            <button
                              key={index}
                              onClick={() => handleVideoClick(index)}
                              className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                                currentVideoIndex === index
                                  ? "border-green-check shadow-lg scale-105"
                                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                              }`}
                            >
                              <video
                                src={video}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                              <div
                                className={`absolute inset-0 flex items-center justify-center ${
                                  currentVideoIndex === index
                                    ? "bg-green-check/20"
                                    : "bg-black/30 hover:bg-black/20"
                                }`}
                              >
                                {currentVideoIndex === index ? (
                                  <div className="bg-green-check text-white rounded-full p-2">
                                    <Play size={16} fill="currentColor" />
                                  </div>
                                ) : (
                                  <div className="bg-white/90 text-gray-900 rounded-full p-2">
                                    <Play size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                {index + 1}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Recording {currentVideoIndex + 1}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Test ID: {testData.testId}
                          </p>
                        </div>
                        <a
                          href={videos[currentVideoIndex]}
                          download={`${testData.testId}_video_${
                            currentVideoIndex + 1
                          }.webm`}
                          className="text-sm text-green-check hover:text-teal-700 font-medium underline"
                        >
                          Download
                        </a>
                      </div>
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
