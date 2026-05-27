import { API_URL } from "../auth/api";

function getToken() {
  return window.localStorage.getItem("workcred_token");
}

async function employerRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login as an employer before using this dashboard.");
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
    throw new Error(data.message || "Employer request failed");
  }

  return data;
}

function toFormData(payload, fileField) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  if (fileField?.file) {
    formData.append(fileField.name, fileField.file);
  }

  return formData;
}

export function getCompanyProfile() {
  return employerRequest("/employer/company-profile");
}

export function createCompanyProfile(payload, companyLogo) {
  return employerRequest("/employer/company-profile", {
    method: "POST",
    body: toFormData(payload, companyLogo ? { name: "companyLogo", file: companyLogo } : null)
  });
}

export function updateCompanyProfile(payload, companyLogo) {
  return employerRequest("/employer/company-profile", {
    method: "PUT",
    body: toFormData(payload, companyLogo ? { name: "companyLogo", file: companyLogo } : null)
  });
}

export function getCompanyWorkers() {
  return employerRequest("/employer/workers");
}

export function addCompanyWorker(payload) {
  return employerRequest("/employer/workers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function verifyWorkerExperience(payload) {
  return employerRequest("/employer/experience-verifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function getEmployerJobs() {
  return employerRequest("/employer/jobs");
}

export function createJob(payload) {
  return employerRequest("/employer/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function updateJob(id, payload) {
  return employerRequest(`/employer/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function deleteJob(id) {
  return employerRequest(`/employer/jobs/${id}`, {
    method: "DELETE"
  });
}

export function getJobApplications(jobId) {
  return employerRequest(`/jobs/${jobId}/applications`);
}

export function updateApplicationStatus(applicationId, applicationStatus) {
  return employerRequest(`/jobs/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ applicationStatus })
  });
}

export function addWorkerRating(payload) {
  return employerRequest("/employer/ratings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
