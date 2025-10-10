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
    navigate(-1);
  };

  const uploadVideoToAPI = async (videoBlob: Blob) => {
    try {
      setUploading(true);
      setUploadStatus("Uploading video...");

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(videoBlob);
      
      await new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            
            // Upload to API - you can customize this endpoint
            const response = await fetch(
              "https://68e89221f2707e6128cb466c.mockapi.io/api/v1/parameters",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: "Video Recording",
                  video: base64data,
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
              setUploadStatus("Upload failed. Please try again.");
            }
            resolve(true);
          } catch (error) {
            setUploadStatus("Upload failed. Please try again.");
            reject(error);
          }
        };
        reader.onerror = reject;
      });
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
      await uploadVideoToAPI(blob);
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
        Camera Live View
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
        <div className={`mb-4 px-4 py-2 rounded-lg ${
          uploadStatus.includes("success") 
            ? "bg-green-100 text-green-700" 
            : uploadStatus.includes("failed")
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700"
        }`}>
          {uploadStatus}
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-2xl shadow-lg border border-slate-200 w-full max-w-lg aspect-video bg-black"
      />
      
      <div className="mt-8 flex gap-4">
        {!isRecording && !uploading ? (
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

