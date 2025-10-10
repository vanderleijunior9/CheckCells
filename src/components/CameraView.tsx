import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CameraView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

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

  const handleAcceptRecording = async () => {
    if (recordedBlob) {
      await uploadVideoToAPI(recordedBlob);
      setShowPreview(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
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

  const compressVideo = async (videoBlob: Blob): Promise<Blob> => {
    // Create a video element to get frames
    const videoUrl = URL.createObjectURL(videoBlob);
    const video = document.createElement("video");
    video.src = videoUrl;

    return new Promise((resolve) => {
      video.onloadedmetadata = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Reduce resolution for smaller file size
        const scale = 0.5; // 50% of original size
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        // Capture frames at lower quality
        const frames: string[] = [];
        const fps = 5; // Capture 5 frames per second (reduced from 30)
        const duration = video.duration;
        const frameInterval = 1 / fps;

        for (
          let time = 0;
          time < Math.min(duration, 10);
          time += frameInterval
        ) {
          video.currentTime = time;
          await new Promise((r) => {
            video.onseeked = r;
          });

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Lower quality JPEG for smaller size
            const frame = canvas.toDataURL("image/jpeg", 0.5);
            frames.push(frame);
          }
        }

        // Store as JSON with metadata instead of full video
        const compressedData = JSON.stringify({
          frames: frames.slice(0, 20), // Max 20 frames
          width: canvas.width,
          height: canvas.height,
          duration: Math.min(duration, 10),
        });

        const blob = new Blob([compressedData], { type: "application/json" });
        URL.revokeObjectURL(videoUrl);
        resolve(blob);
      };
    });
  };

  const uploadVideoToAPI = async (videoBlob: Blob) => {
    try {
      setUploading(true);
      setUploadStatus("Compressing video...");

      // Compress video first
      const compressedBlob = await compressVideo(videoBlob);

      setUploadStatus("Uploading video...");

      // Convert compressed blob to text
      const text = await compressedBlob.text();

      // Upload to API
      const response = await fetch(
        "https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Video Recording",
            video: text,
            volume: 0,
            days: 0,
            delution: 0,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        setUploadStatus("Video uploaded successfully!");
        setTimeout(() => {
          navigate("/all-tests");
        }, 2000);
      } else {
        setUploadStatus(`Upload failed: ${response.status}. Please try again.`);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadStatus("Upload failed. Please try again.");
    } finally {
      setUploading(false);
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
      setCountdown(10);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setUploadStatus("");

    // 10-second countdown
    let timeLeft = 10;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        {showPreview ? "Recording Preview" : "Camera Live View"}
      </h1>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mb-4 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">Recording: {countdown}s</span>
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
      {showPreview ? (
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
              Please review the video above. Accept to upload or reject to record again.
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
        {showPreview ? (
          // Preview mode buttons
          <>
            <button
              className="bg-green-check hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
              onClick={handleAcceptRecording}
              disabled={uploading}
            >
              {uploading ? "Processing..." : "✓ Accept & Upload"}
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
              onClick={handleRejectRecording}
              disabled={uploading}
            >
              ✗ Reject & Record Again
            </button>
          </>
        ) : !isRecording && !uploading ? (
          // Ready to record buttons
          <>
            <button
              className="bg-green-check hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
              onClick={startRecording}
            >
              Start Recording (10s)
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
              onClick={handleStop}
            >
              Cancel
            </button>
          </>
        ) : uploading ? (
          <button
            disabled
            className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold shadow cursor-not-allowed"
          >
            Uploading...
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold shadow cursor-not-allowed"
          >
            Recording... {countdown}s
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraView;
