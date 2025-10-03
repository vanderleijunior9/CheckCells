import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CameraView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Camera Live View
      </h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-2xl shadow-lg border border-slate-200 w-full max-w-lg aspect-video bg-black"
      />
      <button
        className="mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
        onClick={handleStop}
      >
        Stop
      </button>
    </div>
  );
};

export default CameraView;

