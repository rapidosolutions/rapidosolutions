import { request } from "./blogApi";

export function listPublicProjects() {
  return request("/api/projects");
}

export function listAdminProjects() {
  return request("/api/admin/projects");
}

export function getAdminProject(id) {
  return request(`/api/admin/projects/${encodeURIComponent(id)}`);
}

export function createProject(project) {
  return request("/api/admin/projects", { method: "POST", body: project });
}

export function updateProject(id, project) {
  return request(`/api/admin/projects/${encodeURIComponent(id)}`, { method: "PUT", body: project });
}

export function updateProjectStatus(id, status) {
  return request(`/api/admin/projects/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } });
}

export function archiveProject(id) {
  return request(`/api/admin/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function deleteProjectPermanently(id, confirmationTitle) {
  return request(`/api/admin/projects/${encodeURIComponent(id)}/permanent`, {
    method: "DELETE",
    body: { confirmationTitle }
  });
}

export function uploadProjectImage(file) {
  const body = new FormData();
  body.append("image", file);
  return request("/api/admin/uploads/project-image", { method: "POST", body });
}
