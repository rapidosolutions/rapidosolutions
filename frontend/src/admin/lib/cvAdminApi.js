export const CV_ADMIN_BASE = "/system-x7k2";

export const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
let csrfToken = "";

export function setCvAdminCsrf(token) {
  csrfToken = token || "";
}

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

export async function cvAdminLogin(credentials) {
  const data = await request("/api/cv-admin/auth/login", { method: "POST", body: credentials });
  setCvAdminCsrf(data.csrfToken);
  return data;
}

export async function cvAdminVerify2fa(token) {
  const data = await request("/api/cv-admin/auth/verify-2fa", { method: "POST", body: { token } });
  setCvAdminCsrf(data.csrfToken);
  return data;
}

export async function cvAdminSession() {
  const data = await request("/api/cv-admin/auth/session");
  setCvAdminCsrf(data.csrfToken);
  return data;
}

export async function cvAdminLogout() {
  await request("/api/cv-admin/auth/logout", { method: "POST" });
  setCvAdminCsrf("");
}

export function setup2fa() {
  return request("/api/cv-admin/auth/2fa/setup", { method: "POST" });
}

export function confirm2fa(token) {
  return request("/api/cv-admin/auth/2fa/confirm", { method: "POST", body: { token } });
}

export function listCvs(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const suffix = query.toString() ? `?${query}` : "";
  return request(`/api/cv-admin/cvs${suffix}`);
}

export function getCv(id) {
  return request(`/api/cv-admin/cvs/${encodeURIComponent(id)}`);
}

export function createManualCv(payload) {
  return request("/api/cv-admin/cvs", { method: "POST", body: payload });
}

export function updateCvStatus(id, status) {
  return request(`/api/cv-admin/cvs/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } });
}

export function sendCvEmail(id, payload) {
  return request(`/api/cv-admin/cvs/${encodeURIComponent(id)}/email`, { method: "POST", body: payload });
}

export function logWhatsApp(id, message) {
  return request(`/api/cv-admin/cvs/${encodeURIComponent(id)}/whatsapp-log`, { method: "POST", body: { message } });
}

export function getBranding() {
  return request("/api/cv-admin/branding");
}

export function updateBranding(payload) {
  return request("/api/cv-admin/branding", { method: "PUT", body: payload });
}

export function uploadBrandingImage(file) {
  const body = new FormData();
  body.append("image", file);
  return request("/api/cv-admin/uploads/branding", { method: "POST", body });
}

export function listTemplates() {
  return request("/api/cv-admin/templates");
}

export function updateTemplate(id, payload) {
  return request(`/api/cv-admin/templates/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
}

export function previewDocument(payload) {
  return request("/api/cv-admin/documents/preview", { method: "POST", body: payload });
}

export function generateDocument({ cvId, templateId, templateType, finalContentHtml, pdfBlob }) {
  const body = new FormData();
  if (cvId) body.append("cvId", cvId);
  if (templateId) body.append("templateId", templateId);
  if (templateType) body.append("templateType", templateType);
  body.append("finalContentHtml", finalContentHtml);
  if (pdfBlob) body.append("pdf", pdfBlob, "document.pdf");
  return request("/api/cv-admin/documents/generate", { method: "POST", body });
}

export function listAdmins() {
  return request("/api/cv-admin/admins");
}

export function createAdmin(payload) {
  return request("/api/cv-admin/admins", { method: "POST", body: payload });
}

export function setAdminActive(id, isActive) {
  return request(`/api/cv-admin/admins/${encodeURIComponent(id)}/active`, {
    method: "PATCH",
    body: { isActive }
  });
}

export function resetAdminPassword(id) {
  return request(`/api/cv-admin/admins/${encodeURIComponent(id)}/reset-password`, { method: "POST" });
}

export function whatsAppUrl(phone, text) {
  const digits = String(phone || "").replace(/\D/g, "");
  const message = encodeURIComponent(text || "");
  return `https://wa.me/${digits}?text=${message}`;
}

export function whatsappStatus() {
  return request("/api/cv-admin/whatsapp/status");
}

export function whatsappConnect() {
  return request("/api/cv-admin/whatsapp/connect", { method: "POST" });
}

export function whatsappDisconnect() {
  return request("/api/cv-admin/whatsapp/disconnect", { method: "POST" });
}

export function whatsappSend(payload) {
  return request("/api/cv-admin/whatsapp/send", { method: "POST", body: payload });
}
