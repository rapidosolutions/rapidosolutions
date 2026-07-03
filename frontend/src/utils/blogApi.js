import { getSanityBlog, listSanityBlogs } from "./sanityBlogApi";

const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
let csrfToken = "";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
      ...(csrfToken && !["GET", "HEAD"].includes(options.method || "GET") ? { "X-CSRF-Token": csrfToken } : {}),
      ...options.headers
    },
    body: options.body && !isFormData ? JSON.stringify(options.body) : options.body
  });

  if (!response.ok) {
    let message = "The request could not be completed.";
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {
      message = response.statusText || message;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function loginAdmin(credentials) {
  const data = await request("/api/auth/login", { method: "POST", body: credentials });
  csrfToken = data.csrfToken;
  return data;
}

export async function getAdminSession() {
  const data = await request("/api/auth/session");
  csrfToken = data.csrfToken;
  return data;
}

export async function logoutAdmin() {
  await request("/api/auth/logout", { method: "POST" });
  csrfToken = "";
}

export async function changeAdminPassword(currentPassword, newPassword) {
  await request("/api/auth/password", { method: "PATCH", body: { currentPassword, newPassword } });
  csrfToken = "";
}

export function listBlogs({ includeDrafts = false } = {}) {
  return includeDrafts ? request("/api/admin/blogs") : listSanityBlogs();
}

export function getBlog(slug) {
  return getSanityBlog(slug);
}

export function createBlog(blog) {
  return request("/api/admin/blogs", { method: "POST", body: blog });
}

export function updateBlog(id, blog) {
  return request(`/api/admin/blogs/${encodeURIComponent(id)}`, { method: "PUT", body: blog });
}

export function deleteBlog(id) {
  return request(`/api/admin/blogs/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function uploadBlogCover(file) {
  const body = new FormData();
  body.append("image", file);
  return request("/api/admin/uploads/blog-cover", { method: "POST", body });
}

export function submitContact(form) {
  return request("/api/contact", { method: "POST", body: { ...form, website: form.website || "" } });
}

export function listMessages(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/api/admin/messages${query ? `?${query}` : ""}`);
}

export function updateMessageStatus(id, status) {
  return request(`/api/admin/messages/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });
}

export function deleteMessage(id) {
  return request(`/api/admin/messages/${encodeURIComponent(id)}`, { method: "DELETE" });
}
