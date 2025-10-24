interface TestData {
  diagnosticianName: string;
  testId: string;
  dateOfTest: string;
  testType: string;
  status: string;
  volume?: number;
  days?: number;
  delution?: number;
  videoUrl?: string[]; // Array of video URLs from S3
}

interface ApiParameter {
  id: string;
  name: string;
  volume: number;
  days: number;
  delution: number;
  testId?: string;
  comments?: string;
  dateOfTest?: string;
  testType?: string;
  status?: string;
  video?: string;
  videoUrl?: string[]; // Array of video URLs from S3
}

// MockAPI endpoint
const API_BASE_URL = "https://68e89221f2707e6128cb466c.mockapi.io/api/v1";

// Function to fetch all test data
export const fetchTestData = async (): Promise<TestData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/parameters`);

    if (!response.ok) {
      throw new Error("Failed to fetch test data");
    }

    const data: ApiParameter[] = await response.json();

    // Return raw data as-is from API
    return data.map((item) => ({
      diagnosticianName: item.name,
      testId: item.testId || item.id,
      dateOfTest: item.dateOfTest || new Date().toLocaleDateString(),
      testType: item.testType || "All parameters",
      status: item.status || "Completed",
      volume: item.volume,
      days: item.days,
      delution: item.delution,
    }));
  } catch (error) {
    console.error("Error fetching test data:", error);
    throw error;
  }
};

// Function to fetch single test details
export const fetchTestDetails = async (testId: string): Promise<TestData> => {
  try {
    // Extract the ID from the testId (e.g., "TEST-000001" -> "1")
    const id = testId.replace("TEST-", "").replace(/^0+/, "");
    const response = await fetch(`${API_BASE_URL}/parameters/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch test details");
    }

    const item: ApiParameter = await response.json();

    // Transform the API data to match our TestData structure
    return {
      diagnosticianName: item.name,
      testId: item.testId || item.id,
      dateOfTest: item.dateOfTest || new Date().toLocaleDateString(),
      testType: item.testType || "All parameters",
      status: item.status || "Completed",
      volume: item.volume,
      days: item.days,
      delution: item.delution,
    };
  } catch (error) {
    console.error("Error fetching test details:", error);
    throw error;
  }
};

// Function to create a new test
export const createTest = async (
  testData: Partial<TestData>
): Promise<TestData> => {
  try {
    // Transform TestData to ApiParameter format with actual data
    const parameterData = {
      name: testData.diagnosticianName || "",
      testId: testData.testId || "",
      volume: testData.volume || 0,
      days: testData.days || 0,
      delution: testData.delution || 0,
      dateOfTest: testData.dateOfTest || new Date().toLocaleDateString(),
      testType: testData.testType || "All parameters",
      status: testData.status || "Completed",
      videoUrl: testData.videoUrl || [], // Include video URLs array
    };

    console.log("Posting to API:", `${API_BASE_URL}/parameters`, parameterData);

    const response = await fetch(`${API_BASE_URL}/parameters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameterData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error details");
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(
        `Failed to create test: ${response.status} ${response.statusText}`
      );
    }

    const item: ApiParameter = await response.json();
    console.log("API Response:", item);

    // Transform the API response back to TestData structure
    return {
      diagnosticianName: item.name,
      testId: item.testId || `TEST-${String(item.id).padStart(6, "0")}`,
      dateOfTest: item.dateOfTest || new Date().toLocaleDateString(),
      testType: item.testType || "All parameters",
      status: item.status || "Completed",
      volume: item.volume,
      days: item.days,
      delution: item.delution,
      videoUrl: item.videoUrl || [], // Include video URLs in response
    };
  } catch (error) {
    console.error("Error creating test:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to the server");
    }
    throw error;
  }
};

// Function to update test comments
export const updateTestComments = async (
  testId: string,
  comments: string
): Promise<void> => {
  try {
    // Convert to string if needed
    const testIdStr = String(testId);

    // Extract the ID from the testId (e.g., "TEST-000001" -> "1" or "TST-001" -> "1")
    let id = testIdStr;

    if (testIdStr.startsWith("TEST-")) {
      id = testIdStr.replace("TEST-", "").replace(/^0+/, "") || "1";
    } else if (testIdStr.startsWith("TST-")) {
      id = testIdStr.replace("TST-", "").replace(/^0+/, "") || "1";
    }

    console.log("Updating comments for testId:", testIdStr, "-> API ID:", id);
    const response = await fetch(`${API_BASE_URL}/parameters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comments }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Test ${testIdStr} not found (404) - cannot update comments`
        );
      }
      throw new Error(
        `Failed to update comments: ${response.status} ${response.statusText}`
      );
    }

    console.log("Comments updated successfully for testId:", testIdStr);
  } catch (error) {
    console.error("Error updating comments:", error);
    throw error;
  }
};

// Function to fetch test comments
export const fetchTestComments = async (testId: string): Promise<string> => {
  try {
    // Convert to string if needed
    const testIdStr = String(testId);

    // Extract the ID from the testId (e.g., "TEST-000001" -> "1")
    let id = testIdStr;

    // If testId starts with "TEST-" or "TST-", extract the number
    if (testIdStr.startsWith("TEST-")) {
      id = testIdStr.replace("TEST-", "").replace(/^0+/, "") || "1";
    } else if (testIdStr.startsWith("TST-")) {
      id = testIdStr.replace("TST-", "").replace(/^0+/, "") || "1";
    }

    console.log("Fetching comments for testId:", testIdStr, "-> API ID:", id);
    const response = await fetch(`${API_BASE_URL}/parameters/${id}`);

    if (!response.ok) {
      // 404 means the test doesn't exist yet - this is expected for new tests
      if (response.status === 404) {
        console.log(
          `Test ${testIdStr} not found in API (404) - will use default comments`
        );
        return "";
      }

      // For other errors, log but don't throw
      console.warn(
        `API response not OK for testId ${testIdStr}:`,
        response.status,
        response.statusText
      );
      return "";
    }

    const item: ApiParameter = await response.json();
    console.log("Fetched item:", item);
    return item.comments || "";
  } catch (error) {
    // Network errors or JSON parse errors - log but don't crash
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn(
        `Network error fetching comments for testId ${testId} - will use defaults`
      );
    } else {
      console.warn(`Error fetching comments for testId ${testId}:`, error);
    }
    // Return empty string instead of throwing to prevent UI breaks
    return "";
  }
};

export type { TestData, ApiParameter };
