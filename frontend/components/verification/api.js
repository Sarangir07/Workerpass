import { API_URL } from "../auth/api";

const mockVerifications = [
  {
    _id: "mock-verification-1",
    workerId: { name: "Ravi Shinde", email: "ravi.worker@example.com" },
    employerId: { name: "Sunrise Bakery", email: "owner@sunrise.example.com" },
    companyName: "Sunrise Bakery",
    workRole: "Bakery Helper",
    startDate: "2024-01-10",
    endDate: "2025-02-20",
    description: "Helped with dough preparation, tray setup, counter cleaning, and morning packing work.",
    verificationStatus: "Approved",
    employerComments: "Reliable during early morning shifts and careful with hygiene.",
    rating: 4,
    createdAt: "2026-05-20T09:00:00.000Z",
    updatedAt: "2026-05-21T09:00:00.000Z"
  },
  {
    _id: "mock-verification-2",
    workerId: { name: "Ravi Shinde", email: "ravi.worker@example.com" },
    employerId: { name: "Urban Stay Hotel", email: "hr@urbanstay.example.com" },
    companyName: "Urban Stay Hotel",
    workRole: "Housekeeping Staff",
    startDate: "2025-03-01",
    endDate: "",
    description: "Managed room cleaning, linen checks, guest-area hygiene, and daily supervisor handover.",
    verificationStatus: "Pending",
    employerComments: "",
    rating: null,
    createdAt: "2026-05-24T09:00:00.000Z",
    updatedAt: "2026-05-24T09:00:00.000Z"
  },
  {
    _id: "mock-verification-3",
    workerId: { name: "Meena Jadhav", email: "meena.worker@example.com" },
    employerId: { name: "Kitchen Lane", email: "manager@kitchenlane.example.com" },
    companyName: "Kitchen Lane",
    workRole: "Delivery Worker",
    startDate: "2023-07-01",
    endDate: "2024-05-30",
    description: "Handled local food delivery, route coordination, and customer handover updates.",
    verificationStatus: "Rejected",
    employerComments: "Dates could not be confirmed from our records.",
    rating: 2,
    createdAt: "2026-05-18T09:00:00.000Z",
    updatedAt: "2026-05-19T09:00:00.000Z"
  }
];

const mockWorkplaces = [
  {
    employerId: "665000000000000000000101",
    companyId: "775000000000000000000101",
    companyName: "Sunrise Bakery",
    workRole: "Bakery Helper",
    source: "Accepted job",
    lastWorkedAt: "2025-02-20"
  },
  {
    employerId: "665000000000000000000102",
    companyId: "775000000000000000000102",
    companyName: "Urban Stay Hotel",
    workRole: "Housekeeping Staff",
    source: "Employer worker record",
    lastWorkedAt: "2026-01-15"
  },
  {
    employerId: "665000000000000000000103",
    companyId: "775000000000000000000103",
    companyName: "Kitchen Lane",
    workRole: "Delivery Worker",
    source: "Verified workplace",
    lastWorkedAt: "2024-05-30"
  }
];

function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("workcred_token") || "";
}

async function verificationRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login before using experience verification.");
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });
  } catch (error) {
    throw new Error(`Cannot connect to WorkCred API at ${API_URL}. Check that the backend server is running.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Experience verification request failed");
  }

  return data;
}

export async function getWorkerVerifications() {
  try {
    return await verificationRequest("/experience-verifications/worker/me");
  } catch (error) {
    return mockVerifications;
  }
}

export async function getEmployerVerificationRequests() {
  try {
    return await verificationRequest("/experience-verifications/employer/requests");
  } catch (error) {
    return mockVerifications;
  }
}

export async function getEligibleWorkplaces() {
  try {
    return await verificationRequest("/experience-verifications/worker/workplaces");
  } catch (error) {
    return mockWorkplaces;
  }
}

export async function addWorkExperience(payload) {
  return verificationRequest("/experience-verifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function updateVerificationStatus(id, payload) {
  return verificationRequest(`/experience-verifications/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function getMockVerifications() {
  return mockVerifications;
}

export function getMockWorkplaces() {
  return mockWorkplaces;
}
