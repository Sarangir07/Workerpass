import { API_URL } from "../auth/api";

function getToken() {
  return window.localStorage.getItem("workcred_token");
}

async function jobRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to use the job portal.");
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
    throw new Error(data.message || "Job portal request failed");
  }

  return data;
}

function queryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const value = searchParams.toString();
  return value ? `?${value}` : "";
}

export function getJobs(filters = {}) {
  return jobRequest(`/jobs${queryString(filters)}`);
}

export function getJob(id) {
  return jobRequest(`/jobs/${id}`);
}

export function applyForJob(jobId, payload) {
  const formData = new FormData();

  if (payload.resume) {
    formData.append("resume", payload.resume);
  }

  formData.append("coverLetter", payload.coverLetter || "");

  return jobRequest(`/worker-jobs/${jobId}/apply`, {
    method: "POST",
    body: formData
  });
}

export function saveJob(jobId) {
  return jobRequest(`/worker-jobs/${jobId}/save`, {
    method: "POST"
  });
}

export function unsaveJob(jobId) {
  return jobRequest(`/worker-jobs/${jobId}/save`, {
    method: "DELETE"
  });
}

export function getSavedJobs() {
  return jobRequest("/worker-jobs/saved");
}

export function getMyApplications() {
  return jobRequest("/worker-jobs/applied");
}

export function getApplicationDetails(applicationId) {
  return jobRequest(`/worker-jobs/applied/${applicationId}`);
}

export function getApplicationHistory(applicationId) {
  return jobRequest(`/worker-jobs/applications/${applicationId}/history`);
}

export function getWorkerJobDashboard() {
  return jobRequest("/worker-jobs/dashboard");
}

export function getEmployerJobs() {
  return jobRequest("/jobs/employer/my");
}

export function updateJob(id, payload) {
  return jobRequest(`/jobs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function deleteJob(id) {
  return jobRequest(`/jobs/${id}`, {
    method: "DELETE"
  });
}

export function getJobApplications(jobId) {
  return jobRequest(`/jobs/${jobId}/applications`);
}

export function updateApplicationStatus(applicationId, applicationStatus) {
  return jobRequest(`/jobs/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ applicationStatus })
  });
}
