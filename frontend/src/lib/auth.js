import { apiRequest } from "./api";

// REGISTER
export async function registerUser(formData) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
    }),
  });
}

// LOGIN
export async function loginUser(formData) {
  const result = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
    }),
  });

  if (result.success && result.data?.access_token) {
    localStorage.setItem("ztick_token", result.data.access_token);
    localStorage.setItem(
      "ztick_user",
      JSON.stringify(result.data.user)
    );
  }

  return result;
}

// GET PROFILE
export async function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

// LOGOUT
export function logoutUser() {
  localStorage.removeItem("ztick_token");
  localStorage.removeItem("ztick_user");
  window.location.href = "/login";
}