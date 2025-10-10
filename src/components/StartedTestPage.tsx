import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import connectDeviceImg from "../assets/connect-device.png";
import { createTest } from "../services/api";

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
  const [success, setSuccess] = useState("");

  const handleBack = () => {
    navigate("/new-test", { state: form });
  };

  // Function to push test data to API
  const pushTestDataToAPI = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // TODO: Add your conditional logic here
      // Example condition check:
      const meetsRequirements = checkTestRequirements();

      if (!meetsRequirements) {
        setError("Test data does not meet requirements");
        setLoading(false);
        return false;
      }

      // Prepare test data for API
      const testData = {
        diagnosticianName: form.scientist || "",
        testId: form.testId || "",
        testType: "All parameters", // You can make this dynamic
        dateOfTest: new Date().toLocaleDateString(),
        status: "Analyzing",
      };

      // Push data to API
      const result = await createTest(testData);

      setSuccess(`Test created successfully! ID: ${result.testId}`);
      setLoading(false);
      return true;
    } catch (err) {
      setError("Failed to push test data to API");
      console.error("API Error:", err);
      setLoading(false);
      return false;
    }
  };

  // Placeholder function for your conditional logic
  const checkTestRequirements = (): boolean => {
    // TODO: Implement your criteria checking logic here
    // Example conditions:

    // Check if all required fields are filled
    if (!form.scientist || !form.testId || !form.volume || !form.days) {
      return false;
    }

    // Check if volume is within acceptable range
    const volume = parseFloat(form.volume || "0");
    if (volume < 1 || volume > 100) {
      return false;
    }

    // Check if days is within acceptable range
    const days = parseInt(form.days || "0");
    if (days < 1 || days > 10) {
      return false;
    }

    // Add more conditions as needed
    // Example:
    // - Check dilution values
    // - Check test ID format
    // - Validate scientist name

    return true; // All conditions met
  };

  const handleConnectDevice = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // First, push test data to API
      const apiSuccess = await pushTestDataToAPI();

      if (!apiSuccess) {
        return; // Stop if API push failed
      }

      // Then connect to camera
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
          {success && (
            <span className="text-green-600 font-semibold mt-2">{success}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartedTestPage;
