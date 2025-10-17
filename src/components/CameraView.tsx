import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createTest } from "../services/api";
import { uploadVideoToS3, generateS3FileName } from "../services/s3Service";
import { isS3Configured } from "../config/s3Config";

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
  const [uploading, setUploading] = useState(false);
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
  const MAX_RECORDINGS = 5;
  const MAX_RECORDING_DURATION = 15; // Maximum recording duration in seconds

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

  const handleAcceptRecording = () => {
    if (recordedBlob) {
      // Store the video locally, don't upload to API yet
      setAcceptedVideos((prev) => [...prev, recordedBlob]);
      setUploadStatus("Recording accepted!");

      setShowPreview(false);
      const newCount = recordedCount + 1;
      setRecordedCount(newCount);

      // Clean up preview URL and blob
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
      setRecordedBlob(null);

      // Show prompt to record another if not at max
      if (newCount < MAX_RECORDINGS) {
        setShowRecordAnotherPrompt(true);
      } else {
        // Max recordings reached, show final preview
        setTimeout(() => {
          handleFinishRecording();
        }, 2000);
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

      // Log summary of what will be saved
      console.log("=== SAVING TEST SUMMARY ===");
      console.log("Form Data:", {
        scientist: formData.scientist,
        testId: formData.testId,
        volume: formData.volume,
        days: formData.days,
        dilution: formData.dilution,
      });
      console.log(`Number of videos: ${acceptedVideos.length}`);
      console.log("===========================");

      // Upload all accepted videos to API first
      console.log(`Uploading ${acceptedVideos.length} videos to API...`);
      setUploadStatus(`Uploading videos (0/${acceptedVideos.length})...`);

      for (let i = 0; i < acceptedVideos.length; i++) {
        setUploadStatus(
          `Uploading videos (${i + 1}/${acceptedVideos.length})...`
        );
        await uploadVideoToAPI(acceptedVideos[i], i + 1);
      }

      setUploadStatus("Saving test information...");

      // Prepare test data for API
      const testData = {
        diagnosticianName: formData.scientist,
        testId: formData.testId,
        volume: parseFloat(formData.volume || "0") || 0,
        days: parseFloat(formData.days || "0") || 0,
        delution: parseFloat(formData.dilution || "0") || 0,
        dateOfTest: new Date().toLocaleDateString(),
        testType: "All parameters",
        status: "Completed",
      };

      console.log("Saving test to API:", testData);

      // Post test data to API
      const result = await createTest(testData);

      console.log("Test saved successfully:", result);

      setUploadStatus("Test saved successfully!");

      // Navigate to all tests page after successful save
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

  const compressVideo = async (videoBlob: Blob): Promise<Blob> => {
    // Create a video element to get frames
    const videoUrl = URL.createObjectURL(videoBlob);
    const video = document.createElement("video");
    video.src = videoUrl;

    return new Promise((resolve) => {
      video.onloadedmetadata = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Aggressive resolution reduction for smaller file size
        const scale = 0.3; // 30% of original size (reduced from 50%)
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        // Capture frames at very low rate
        const frames: string[] = [];
        const fps = 2; // Capture 2 frames per second (reduced from 5)
        const duration = video.duration;
        const frameInterval = 1 / fps;

        for (
          let time = 0;
          time < Math.min(duration, MAX_RECORDING_DURATION);
          time += frameInterval
        ) {
          video.currentTime = time;
          await new Promise((r) => {
            video.onseeked = r;
          });

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Very low quality JPEG for much smaller size
            const frame = canvas.toDataURL("image/jpeg", 0.3);
            frames.push(frame);
          }
        }

        // Store as JSON with metadata, limit frames based on fps and duration
        // At 2 fps for 15 seconds = max 30 frames
        const maxFrames = Math.ceil(fps * MAX_RECORDING_DURATION);
        const compressedData = JSON.stringify({
          frames: frames.slice(0, maxFrames),
          width: canvas.width,
          height: canvas.height,
          duration: Math.min(duration, MAX_RECORDING_DURATION),
        });

        const blob = new Blob([compressedData], { type: "application/json" });
        URL.revokeObjectURL(videoUrl);
        resolve(blob);
      };
    });
  };

  const uploadVideoToAPI = async (videoBlob: Blob, recordingNumber: number) => {
    try {
      setUploading(true);
      
      let s3Url = "";
      
      // Upload original video to S3 if configured
      if (isS3Configured()) {
        setUploadStatus(`Uploading video ${recordingNumber} to S3...`);
        
        try {
          const fileName = generateS3FileName(
            formData.testId || "unknown",
            recordingNumber
          );
          
          const metadata = {
            scientist: formData.scientist || "",
            testId: formData.testId || "",
            recordingNumber: recordingNumber.toString(),
          };
          
          s3Url = await uploadVideoToS3(videoBlob, fileName, metadata);
          console.log(`Video ${recordingNumber} uploaded to S3:`, s3Url);
        } catch (s3Error) {
          console.error("S3 upload failed, will continue with compressed version:", s3Error);
          setUploadStatus(`S3 upload failed, using compressed version...`);
        }
      }
      
      setUploadStatus(`Compressing video ${recordingNumber}...`);

      // Compress video for API backup
      const compressedBlob = await compressVideo(videoBlob);

      setUploadStatus(`Uploading metadata ${recordingNumber}...`);

      // Convert compressed blob to text
      const text = await compressedBlob.text();

      // Prepare data payload with user inputs + video info
      const dataToUpload = {
        name: "Video Recording",
        video: text, // Compressed video as backup
        s3Url: s3Url, // S3 URL of original video
        // User-inputted information from form
        scientist: formData.scientist || "",
        testId: formData.testId || "",
        volume: parseFloat(formData.volume || "0") || 0,
        days: parseFloat(formData.days || "0") || 0,
        delution: parseFloat(formData.dilution || "0") || 0,
        // Auto-generated metadata
        timestamp: new Date().toISOString(),
        recordingNumber: recordingNumber,
      };

      // Log the data being uploaded (for debugging)
      console.log("Uploading data to API:", {
        scientist: dataToUpload.scientist,
        testId: dataToUpload.testId,
        volume: dataToUpload.volume,
        days: dataToUpload.days,
        dilution: dataToUpload.delution,
        recordingNumber: dataToUpload.recordingNumber,
        timestamp: dataToUpload.timestamp,
        s3Url: s3Url || "Not configured",
        compressedVideoSize: `${(text.length / 1024).toFixed(2)} KB`,
      });

      // Upload to API - single POST with all data combined
      const response = await fetch(
        "https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToUpload),
        }
      );

      if (response.ok) {
        setUploadStatus("Video uploaded successfully!");
        console.log("Video and user data uploaded successfully!");
        // Don't navigate automatically anymore - let the prompt handle it
      } else if (response.status === 404) {
        setUploadStatus(
          "API endpoint not found. Please check your connection."
        );
        console.error(
          "404 Error: API endpoint not found. URL:",
          "https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters"
        );
      } else if (response.status === 413) {
        setUploadStatus(
          "Video is still too large. Recording saved locally only."
        );
        console.error(
          "413 Error: Video compressed but still too large for API"
        );
      } else if (response.status === 400) {
        setUploadStatus("Invalid data format. Please check your inputs.");
        console.error("400 Error: Bad request - invalid data format");
      } else if (response.status === 500) {
        setUploadStatus("Server error. Please try again later.");
        console.error("500 Error: Internal server error");
      } else {
        setUploadStatus(`Upload failed: ${response.status}. Please try again.`);
        console.error(
          `HTTP Error ${response.status}:`,
          await response.text().catch(() => "No error details")
        );
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setUploadStatus(
          "Network error. Please check your internet connection."
        );
      } else {
        setUploadStatus("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
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
          Videos recorded: {recordedCount}/{MAX_RECORDINGS}
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
              Video Uploaded Successfully!
            </h2>
            <p className="text-green-700 mb-2">
              You have recorded {recordedCount} out of {MAX_RECORDINGS} videos.
            </p>
            {recordedCount < MAX_RECORDINGS ? (
              <p className="text-green-600 text-lg font-medium">
                Would you like to record another video?
              </p>
            ) : (
              <p className="text-green-600 text-lg font-medium">
                You've reached the maximum number of recordings!
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
              Yes, Record Another
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition text-lg"
              onClick={handleFinishRecording}
            >
              No, Finish
            </button>
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
        ) : !uploading ? (
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
        ) : (
          <button
            disabled
            className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold shadow cursor-not-allowed"
          >
            Uploading...
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraView;
