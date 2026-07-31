import { apiBase, request } from "./blogApi";

export function analyzeResume(file, targetRole = "") {
  const body = new FormData();
  body.append("resume", file);
  body.append("targetRole", targetRole);
  return request("/api/resume/analyze", { method: "POST", body });
}

export function analyzeSampleResume(targetRole = "") {
  return request("/api/resume/analyze/sample", { method: "POST", body: { targetRole } });
}

export function rebuildResume(payload) {
  return request("/api/resume/rebuild", { method: "POST", body: payload });
}

export function generateResume(payload) {
  return request("/api/resume/generate", { method: "POST", body: payload });
}

export async function exportResumePdf(markdown, fileName) {
  const response = await fetch(`${apiBase}/api/resume/export/pdf`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown, fileName })
  });

  if (!response.ok) {
    let message = "The PDF could not be prepared.";
    try {
      const data = await response.json();
      message = data.error || data.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.blob();
}
