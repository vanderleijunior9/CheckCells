import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const Newtestpage = () => {
  const location = useLocation();
  const [form, setForm] = useState(
    location.state || {
      scientist: "",
      testId: "",
      volume: "",
      days: "",
      dilution: "",
    }
  );
  const [error, setError] = useState(""); // error message
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev: any) => ({ ...prev, [id]: value }));
    setError(""); // clear error when typing
  };

  const handleBeginTest = () => {
    // check if any field is empty
    const emptyField = Object.entries(form).find(
      ([, val]) => (val as string).trim() === ""
    );
    if (emptyField) {
      setError(`⚠️ Please complete all fields before continuing.`);
      return;
    }
    navigate("/started-test", { state: form });
  };

  const handleCancel = () => {
    setForm({
      scientist: "",
      testId: "",
      volume: "",
      days: "",
      dilution: "",
    });
    setError("");
  };

  const formFields = [
    {
      id: "scientist",
      label: "Technologist Name/ID",
      placeholder: "First and last name or ID",
    },
    { id: "testId", label: "Test ID", placeholder: "Enter test ID" },
    { id: "volume", label: "Volume", placeholder: "mL/g" },
    {
      id: "days",
      label: "Days Since Previous Ejaculation",
      placeholder: "Enter number",
    },
    { id: "dilution", label: "Dilution", placeholder: "Value" },
  ];

  return (
    <div className="py-10 px-16 bg-white rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Input Fields
      </h1>
      <p className="text-gray-700 mb-8">
        Fill in the fields below to customize results and get started.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {formFields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              {field.label}
            </label>
            <input
              id={field.id}
              placeholder={field.placeholder}
              value={form[field.id]}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full px-4 py-2 border ${
                error && form[field.id].trim() === ""
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-green-700 focus:outline-none text-black bg-white`}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <button
          className="px-4 py-2 rounded-md border border-gray-300 hover: text-gray-700 cursor-pointer"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 cursor-pointer rounded-md bg-green-700 text-white hover:bg-green-800"
          onClick={handleBeginTest}
        >
          Begin Test
        </button>
      </div>
    </div>
  );
};
