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
    // Transform TestData to ApiParameter format
    const parameterData = {
      name: testData.diagnosticianName || "",
      volume: Math.floor(Math.random() * 100),
      days: Math.floor(Math.random() * 100),
      delution: Math.floor(Math.random() * 100),
    };

    const response = await fetch(`${API_BASE_URL}/parameters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameterData),
    });

    if (!response.ok) {
      throw new Error("Failed to create test");
    }

    const item: ApiParameter = await response.json();

    // Transform the API response back to TestData structure
    return {
      diagnosticianName: item.name,
      testId: item.testId || `TEST-${String(item.id).padStart(6, "0")}`,
      dateOfTest: new Date().toLocaleDateString(),
      testType: testData.testType || "All parameters",
      status: "Analyzing",
    };
  } catch (error) {
    console.error("Error creating test:", error);
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
      throw new Error("Failed to update comments");
    }
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
      console.error(
        "API response not OK:",
        response.status,
        response.statusText
      );
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }

    const item: ApiParameter = await response.json();
    console.log("Fetched item:", item);
    return item.comments || "";
  } catch (error) {
    console.error("Error fetching comments for testId:", testId, error);
    // Return empty string instead of throwing to prevent UI breaks
    return "";
  }
};

export type { TestData, ApiParameter };
