export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function postAuth(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

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
  window.localStorage.setItem("workcred_demo_role", data.user.userType);
}
