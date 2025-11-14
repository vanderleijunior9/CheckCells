import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface FormData {
  scientist?: string;
  testId?: string;
  volume?: string;
  days?: string;
  dilution?: string;
}

const CameraView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const formData = (location.state as FormData) || {};

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [recordedCount, setRecordedCount] = useState(0);
  const [showRecordAnotherPrompt, setShowRecordAnotherPrompt] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [acceptedVideos, setAcceptedVideos] = useState<Blob[]>([]);
  const [totalVideoDuration, setTotalVideoDuration] = useState(0);
  const MAX_RECORDINGS = 5;
  const MAX_RECORDING_DURATION = 15; // Maximum recording duration in seconds
  const REQUIRED_TOTAL_DURATION = 15; // Required total duration across all videos in seconds

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        navigate(-1);
      }
    })();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [navigate]);

  // Helper function to get duration of a video blob
  const getVideoDuration = (blob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      const videoUrl = URL.createObjectURL(blob);
      const video = document.createElement("video");
      video.src = videoUrl;

      video.onloadedmetadata = () => {
        const duration = video.duration;
        URL.revokeObjectURL(videoUrl);
        resolve(duration);
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        resolve(0); // Return 0 if error
      };
    });
  };

  const handleStop = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    // Clean up preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    navigate(-1);
  };

  const handleAcceptRecording = async () => {
    if (recordedBlob) {
      // Get duration of the current video
      const currentDuration = await getVideoDuration(recordedBlob);
      const newTotalDuration = totalVideoDuration + currentDuration;

      // Store the video locally, don't upload to API yet
      setAcceptedVideos((prev) => [...prev, recordedBlob]);
      setTotalVideoDuration(newTotalDuration);
      setUploadStatus(
        `Recording accepted! Total: ${Math.round(
          newTotalDuration
        )}s / ${REQUIRED_TOTAL_DURATION}s`
      );

      setShowPreview(false);
      const newCount = recordedCount + 1;
      setRecordedCount(newCount);

      // Clean up preview URL and blob
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
      setRecordedBlob(null);

      // Condition-based logic:
      // 1. If first video, automatically prompt for another (no finish option)
      // 2. If second or later video, check if total duration >= 15 seconds
      //    - If yes, show finish option
      //    - If no, prompt for another video (no finish option if < 15s)

      if (newCount >= MAX_RECORDINGS) {
        // Max recordings reached, show final preview
        setTimeout(() => {
          handleFinishRecording();
        }, 2000);
      } else if (newCount === 1) {
        // First video: automatically prompt for another without "No, Finish" option
        setShowRecordAnotherPrompt(true);
      } else if (newTotalDuration >= REQUIRED_TOTAL_DURATION) {
        // Total duration reached, show option to finish or record more
        setShowRecordAnotherPrompt(true);
      } else {
        // Still need more duration, automatically prompt for another
        setShowRecordAnotherPrompt(true);
      }
    }
  };

  const handleRejectRecording = () => {
    setShowPreview(false);
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setUploadStatus("");
  };

  const handleRecordAnother = () => {
    setShowRecordAnotherPrompt(false);
    setUploadStatus("");

    // Clean up previous recording state
    setRecordedBlob(null);
    setPreviewUrl("");
    setShowPreview(false);

    // Ready to record again
  };

  const handleFinishRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowFinalPreview(true);
  };

  const handleSaveTest = async () => {
    try {
      setSaving(true);
      setSaveError("");
      setUploadStatus("Preparing to save test...");

      // Validate form data
      if (!formData.scientist || !formData.testId) {
        throw new Error(
          "Missing required fields: Scientist name and Test ID are required"
        );
      }

      // Log summary of what was captured
      console.log("=== TEST CAPTURE SUMMARY ===");
      console.log("Form Data:", {
        scientist: formData.scientist,
        testId: formData.testId,
        volume: formData.volume,
        days: formData.days,
        dilution: formData.dilution,
      });
      console.log(`Number of videos captured: ${acceptedVideos.length}`);
      console.log(`Total video duration: ${Math.round(totalVideoDuration)}s`);

      // Videos are stored locally in acceptedVideos state (no upload needed)
      setUploadStatus("Test captured successfully!");

      // Navigate to all tests page after successful capture
      setTimeout(() => {
        navigate("/all-tests");
      }, 500);
    } catch (error) {
      console.error("Error saving test:", error);

      // Better error message handling
      let errorMessage = "Failed to save test. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setSaveError(errorMessage);
      setSaving(false);
      setUploadStatus("");
    }
  };

  const handleRejectTest = () => {
    // Go back to the form
    navigate("/new-test", { state: formData });
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm",
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
      setIsRecording(false);
      setRecordingTime(0);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    setUploadStatus("");

    // Timer to track recording duration (counts up)
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += 1;
      setRecordingTime(elapsed);

      // Auto-stop at maximum duration
      if (elapsed >= MAX_RECORDING_DURATION) {
        clearInterval(timer);
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }
    }, 1000);

    // Store timer ID to clear it when recording stops
    mediaRecorder.addEventListener(
      "stop",
      () => {
        clearInterval(timer);
      },
      { once: true }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        {showFinalPreview
          ? "Test Summary - Review Before Saving"
          : showRecordAnotherPrompt
          ? `Recordings Complete (${recordedCount}/${MAX_RECORDINGS})`
          : showPreview
          ? "Recording Preview"
          : "Camera Live View"}
      </h1>

      {/* Recording Counter */}
      {!showRecordAnotherPrompt && !showPreview && (
        <div className="mb-2 text-gray-600 text-sm font-medium">
          <div>
            Videos recorded: {recordedCount}/{MAX_RECORDINGS}
          </div>
          {recordedCount > 0 && (
            <div
              className={`mt-1 ${
                totalVideoDuration >= REQUIRED_TOTAL_DURATION
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              Total duration: {Math.round(totalVideoDuration)}s /{" "}
              {REQUIRED_TOTAL_DURATION}s
            </div>
          )}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div
          className={`mb-4 ${
            recordingTime >= MAX_RECORDING_DURATION - 3
              ? "bg-orange-600"
              : "bg-red-600"
          } text-white px-4 py-2 rounded-lg flex items-center gap-3`}
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">
            Recording: {recordingTime}s / {MAX_RECORDING_DURATION}s
          </span>
          {recordingTime >= MAX_RECORDING_DURATION - 3 && (
            <span className="text-xs font-normal animate-pulse">
              (Auto-stop soon)
            </span>
          )}
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg ${
            uploadStatus.includes("success")
              ? "bg-green-100 text-green-700"
              : uploadStatus.includes("failed")
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {uploadStatus}
        </div>
      )}

      {/* Preview or Live View */}
      {showFinalPreview ? (
        <div className="w-full max-w-2xl">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8">
            <div className="text-6xl mb-6 text-center">📋</div>
            <h2 className="text-xl font-bold text-blue-900 mb-6 text-center">
              Review Your Test Information
            </h2>

            {/* Test Summary */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div className="border-b pb-3 md:border-b-0 md:pb-0">
                  <span className="font-semibold text-gray-600">
                    Laboratory Scientist:
                  </span>
                  <p className="text-lg mt-1">{formData.scientist || "N/A"}</p>
                </div>
                <div className="border-b pb-3 md:border-b-0 md:pb-0">
                  <span className="font-semibold text-gray-600">Test ID:</span>
                  <p className="text-lg mt-1">{formData.testId || "N/A"}</p>
                </div>
                <div className="border-b pb-3 md:border-b-0 md:pb-0">
                  <span className="font-semibold text-gray-600">Volume:</span>
                  <p className="text-lg mt-1">{formData.volume || "N/A"}</p>
                </div>
                <div className="border-b pb-3 md:border-b-0 md:pb-0">
                  <span className="font-semibold text-gray-600">
                    Days Since Previous Ejaculation:
                  </span>
                  <p className="text-lg mt-1">{formData.days || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Dilution:</span>
                  <p className="text-lg mt-1">{formData.dilution || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">
                    Videos Recorded:
                  </span>
                  <p className="text-lg mt-1">{recordedCount}</p>
                </div>
              </div>
            </div>

            {/* Recorded Videos Preview */}
            {acceptedVideos.length > 0 && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recorded Videos ({acceptedVideos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acceptedVideos.map((videoBlob, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Recording {index + 1}
                      </p>
                      <video
                        src={URL.createObjectURL(videoBlob)}
                        controls
                        className="rounded-lg w-full aspect-video bg-black"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Size: {(videoBlob.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800 font-medium">
                Please review the information above carefully.
              </p>
              <p className="text-blue-700 text-sm mt-2">
                You have {recordedCount} video(s) ready. Click "Save Test" to
                upload all videos and save the test, or "Reject" to go back.
              </p>
            </div>

            {/* Save Error Message */}
            {saveError && (
              <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                <p className="text-red-800 font-semibold">{saveError}</p>
              </div>
            )}
          </div>
        </div>
      ) : showRecordAnotherPrompt ? (
        <div className="w-full max-w-lg">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Video Accepted!
            </h2>
            <p className="text-green-700 mb-2">
              You have recorded {recordedCount} out of {MAX_RECORDINGS} videos.
            </p>
            <p className="text-green-700 mb-2 font-semibold">
              Total Duration: {Math.round(totalVideoDuration)}s /{" "}
              {REQUIRED_TOTAL_DURATION}s
            </p>
            {recordedCount === 1 ? (
              <p className="text-green-600 text-lg font-medium">
                Please record at least one more video.
              </p>
            ) : totalVideoDuration < REQUIRED_TOTAL_DURATION ? (
              <p className="text-orange-600 text-lg font-medium">
                Need {Math.round(REQUIRED_TOTAL_DURATION - totalVideoDuration)}s
                more to reach {REQUIRED_TOTAL_DURATION}s total.
              </p>
            ) : (
              <p className="text-green-600 text-lg font-medium">
                Minimum duration reached! Record more or finish the test.
              </p>
            )}
          </div>
        </div>
      ) : showPreview ? (
        <div className="w-full max-w-lg">
          <video
            src={previewUrl}
            controls
            autoPlay
            loop
            className="rounded-2xl shadow-lg border border-slate-200 w-full aspect-video bg-black"
          />
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">
              Review your recording
            </p>
            <p className="text-blue-600 text-sm">
              Please review the video above. Accept to upload or reject to
              record again.
            </p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-2xl shadow-lg border border-slate-200 w-full max-w-lg aspect-video bg-black"
        />
      )}

      <div className="mt-8 flex gap-4">
        {showFinalPreview ? (
          // Final preview buttons - Save or Reject
          <>
            <button
              className="bg-green-check hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow transition text-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleSaveTest}
              disabled={saving}
            >
              {saving ? "Saving..." : "✓ Save Test"}
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold shadow transition text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRejectTest}
              disabled={saving}
            >
              ✗ Reject & Go Back
            </button>
          </>
        ) : showRecordAnotherPrompt ? (
          // Record another prompt buttons
          <>
            <button
              className="bg-green-check hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition text-lg"
              onClick={handleRecordAnother}
            >
              {recordedCount === 1 ||
              totalVideoDuration < REQUIRED_TOTAL_DURATION
                ? "Record Another Video"
                : "Yes, Record Another"}
            </button>
            {/* Only show "No, Finish" button if we have at least 2 videos AND reached minimum duration */}
            {recordedCount > 1 &&
              totalVideoDuration >= REQUIRED_TOTAL_DURATION && (
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition text-lg"
                  onClick={handleFinishRecording}
                >
                  No, Finish
                </button>
              )}
          </>
        ) : showPreview ? (
          // Preview mode buttons
          <>
            <button
              className="bg-green-check hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
              onClick={handleAcceptRecording}
            >
              ✓ Accept Recording
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
              onClick={handleRejectRecording}
            >
              ✗ Reject & Record Again
            </button>
          </>
        ) : isRecording ? (
          // Recording in progress - show stop button
          <>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
              onClick={stopRecording}
            >
              ⬛ Stop Recording
            </button>
          </>
        ) : (
          // Ready to record buttons
          <>
            <button
              className="bg-green-check hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
              onClick={startRecording}
              disabled={recordedCount >= MAX_RECORDINGS}
            >
              {recordedCount >= MAX_RECORDINGS
                ? "Maximum Recordings Reached"
                : `🔴 Start Recording (Max ${MAX_RECORDING_DURATION}s)`}
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
              onClick={handleStop}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraView;
