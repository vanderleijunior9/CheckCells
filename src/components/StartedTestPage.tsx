import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import connectDeviceImg from "../assets/connect-device.png";

interface FormData {
  scientist?: string;
  testId?: string;
  volume?: string;
  days?: string;
  dilution?: string;
}

const StartedTestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const form = (location.state as FormData) || {};
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate("/new-test", { state: form });
  };

  const handleConnectDevice = async () => {
    setError("");
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setLoading(false);
      navigate("/camera-view");
    } catch (e) {
      setLoading(false);
      setError("Failed to start camera");
    }
  };

  return (
    <div>
      <button
        className="text-black px-4 py-4 rounded-md flex items-center gap-2 mb-4 cursor-pointer"
        onClick={handleBack}
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <div className="p-4 mt-8 bg-washed-white border rounded-tl-3xl">
        <h1 className="font-semibold text-gray-900 mb-4">Information Review</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-black">
          <div>
            <span className="font-medium text-gray-600">
              Laboratory Scientist:
            </span>{" "}
            {form.scientist || (
              <span className="italic text-gray-400">Not provided</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-600">Test ID:</span>{" "}
            {form.testId || (
              <span className="italic text-gray-400">Not provided</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-600">Volume:</span>{" "}
            {form.volume || (
              <span className="italic text-gray-400">Not provided</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-600">
              Days Since Previous Ejaculation:
            </span>{" "}
            {form.days || (
              <span className="italic text-gray-400">Not provided</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-600">Dilution:</span>{" "}
            {form.dilution || (
              <span className="italic text-gray-400">Not provided</span>
            )}
          </div>
        </div>
      </div>
      <div className="flexi *:tems-center">
        <img
          src={connectDeviceImg}
          alt="connect-device"
          className="mx-auto mb-4 w-[390px]"
        />
        <div className="flex flex-col items-center gap-4">
          <span className="text-gray-600">
            Connect your device to your laptop to continue
          </span>
          <button
            className="bg-green-check text-white px-4 py-2 rounded-md "
            onClick={handleConnectDevice}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect Device"}
          </button>
          {error && (
            <span className="text-red-600 font-semibold mt-2">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartedTestPage;

