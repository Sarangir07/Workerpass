export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function postAuth(path, payload) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw new Error(`Cannot connect to WorkCred API at ${API_URL}. Check that the backend server is running.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function saveAuthSession(data) {
  if (!data?.token || !data?.user) {
    return;
  }

  window.localStorage.setItem("workcred_token", data.token);
  window.localStorage.setItem("workcred_user", JSON.stringify(data.user));
  window.localStorage.setItem("workcred_demo_role", data.user.role || data.user.userType);
}
