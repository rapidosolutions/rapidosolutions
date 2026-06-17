const apiBase = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.adminKey ? { "X-Admin-Key": options.adminKey } : {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    let message = "Blog request failed.";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function listBlogs({ includeDrafts = false, adminKey = "" } = {}) {
  const query = includeDrafts ? "?status=all" : "";
  return request(`/api/blogs${query}`, { adminKey });
}

export async function getBlog(slug) {
  return request(`/api/blogs/${slug}`);
}

export async function createBlog(blog, adminKey = "") {
  return request("/api/blogs", { method: "POST", body: blog, adminKey });
}

export async function updateBlog(id, blog, adminKey = "") {
  return request(`/api/blogs/${id}`, { method: "PUT", body: blog, adminKey });
}

export async function deleteBlog(id, adminKey = "") {
  return request(`/api/blogs/${id}`, { method: "DELETE", adminKey });
}
