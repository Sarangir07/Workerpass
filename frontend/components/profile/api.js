import { API_URL } from "../auth/api";
import { availabilityOptions, initialProfile, workerCategories } from "../../lib/profileData";

const availabilityMap = {
  available: "available",
  working: "busy",
  part_time: "available",
  not_available: "not_available"
};

const supportedCategories = new Set(["baker", "waiter", "cleaner", "cashier", "delivery_boy", "other"]);

const profileNotFoundMessage = "Worker profile not found";

const frontendAvailabilityMap = {
  available: "available",
  busy: "working",
  not_available: "not_available"
};

function getToken() {
  return window.localStorage.getItem("workcred_token");
}

async function requestWorkerProfile(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login before saving your worker dashboard.");
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
    throw new Error(data.message || "Worker dashboard request failed");
  }

  return data;
}

function rememberWorkerProfile(profile) {
  if (profile?._id) {
    window.localStorage.setItem("workcred_worker_profile_id", profile._id);
  }
}

function forgetWorkerProfile() {
  window.localStorage.removeItem("workcred_worker_profile_id");
}

export function mapWorkerProfileFromApi(workerProfile) {
  if (!workerProfile) {
    return initialProfile;
  }

  const category =
    workerProfile.jobCategory && workerProfile.jobCategory !== "other"
      ? workerProfile.jobCategory
      : workerCategories.find((item) => item.label === workerProfile.customJobTitle)?.id || "";

  return {
    ...initialProfile,
    id: workerProfile._id,
    fullName: workerProfile.fullName || "",
    phone: workerProfile.phone || "",
    email: workerProfile.email || workerProfile.user?.email || "",
    address: workerProfile.location || "",
    dateOfBirth: workerProfile.dateOfBirth || "",
    gender: workerProfile.gender || "",
    bio: workerProfile.bio || "",
    category,
    availability: frontendAvailabilityMap[workerProfile.availabilityStatus] || "",
    skills: Array.isArray(workerProfile.skills) ? workerProfile.skills : [],
    languages: Array.isArray(workerProfile.languages)
      ? workerProfile.languages.map((name) => ({ name, proficiency: "Conversational" }))
      : [],
    experiences: Array.isArray(workerProfile.experience)
      ? workerProfile.experience.map((item) => ({
          company: item.company || "",
          role: item.jobTitle || "",
          startDate: item.startDate || "",
          endDate: item.endDate || "",
          current: Boolean(item.current),
          description: item.description || ""
        }))
      : [],
    photo: workerProfile.profilePhoto || null,
    resume: workerProfile.resume
      ? {
          ...workerProfile.resume,
          name: workerProfile.resume.originalName || workerProfile.resume.fileName || "Uploaded resume"
        }
      : null
  };
}

export async function getCurrentWorkerProfile() {
  try {
    const workerProfile = await requestWorkerProfile("/worker-dashboard/me");
    rememberWorkerProfile(workerProfile);
    return mapWorkerProfileFromApi(workerProfile);
  } catch (error) {
    if (error.message.includes(profileNotFoundMessage)) {
      forgetWorkerProfile();
      return null;
    }

    throw error;
  }
}

function yearsBetween(startDate, endDate, current) {
  if (!startDate) {
    return 0;
  }

  const start = new Date(`${startDate}-01`);
  const end = current || !endDate ? new Date() : new Date(`${endDate}-01`);
  const monthCount = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();

  return Math.max(0, Math.round((monthCount / 12) * 10) / 10);
}

function appendJson(formData, key, value) {
  formData.append(key, JSON.stringify(value));
}

export function buildWorkerProfileFormData(profile) {
  const formData = new FormData();
  const selectedCategory = workerCategories.find((item) => item.id === profile.category);
  const jobCategory = supportedCategories.has(profile.category) ? profile.category : "other";
  const selectedAvailability = availabilityOptions.find((item) => item.id === profile.availability);

  formData.append("fullName", profile.fullName);
  formData.append("phone", profile.phone);
  formData.append("email", profile.email);
  formData.append("dateOfBirth", profile.dateOfBirth || "");
  formData.append("gender", profile.gender || "");
  formData.append("location", profile.address || "");
  formData.append("jobCategory", jobCategory);
  formData.append("customJobTitle", jobCategory === "other" ? selectedCategory?.label || profile.category : "");
  formData.append("availabilityStatus", availabilityMap[profile.availability] || "available");
  formData.append("bio", profile.bio || selectedAvailability?.label || "");
  appendJson(formData, "skills", profile.skills);
  appendJson(
    formData,
    "languages",
    profile.languages.map((language) => language.name)
  );
  appendJson(
    formData,
    "experience",
    profile.experiences.map((item) => ({
      jobTitle: item.role,
      company: item.company,
      years: yearsBetween(item.startDate, item.endDate, item.current),
      startDate: item.startDate,
      endDate: item.endDate,
      current: item.current,
      description: item.description
    }))
  );

  if (profile.photo instanceof File) {
    formData.append("profilePhoto", profile.photo);
  }

  if (profile.resume instanceof File) {
    formData.append("resume", profile.resume);
  }

  return formData;
}

export async function saveWorkerProfile(profile) {
  const formData = buildWorkerProfileFormData(profile);
  const existingProfileId = window.localStorage.getItem("workcred_worker_profile_id");

  if (existingProfileId) {
    try {
      const updatedProfile = await requestWorkerProfile(`/worker-dashboard/${existingProfileId}`, {
        method: "PUT",
        body: formData
      });
      rememberWorkerProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      if (!error.message.includes(profileNotFoundMessage)) {
        throw error;
      }

      forgetWorkerProfile();
    }
  }

  try {
    const existingProfile = await requestWorkerProfile("/worker-dashboard/me");
    rememberWorkerProfile(existingProfile);

    const updatedProfile = await requestWorkerProfile(`/worker-dashboard/${existingProfile._id}`, {
      method: "PUT",
      body: formData
    });

    rememberWorkerProfile(updatedProfile);
    return updatedProfile;
  } catch (error) {
    if (!error.message.includes(profileNotFoundMessage)) {
      throw error;
    }
  }

  const createdProfile = await requestWorkerProfile("/worker-dashboard", {
    method: "POST",
    body: formData
  });
  rememberWorkerProfile(createdProfile);

  return createdProfile;
}
