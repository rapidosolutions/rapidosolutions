const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "7vlwxcu7",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2025-01-01",
  studioUrl: import.meta.env.VITE_SANITY_STUDIO_URL || "https://www.sanity.io/organizations/oP1ziOL5H/project/7vlwxcu7"
};

const blogFields = `{
  "id": _id,
  title,
  "slug": slug.current,
  category,
  summary,
  author,
  readTime,
  publishedAt,
  "createdAt": coalesce(publishedAt, _createdAt),
  coverImage {
    alt,
    "url": asset->url
  },
  content,
  body[] {
    ...,
    children[] {
      ...,
      text
    }
  }
}`;

const publishedFilter = `!(_id in path("drafts.**")) && defined(slug.current) && (!defined(publishedAt) || publishedAt <= now())`;

function plainTextFromBlocks(blocks = []) {
  return blocks
    .map((block) => block.children?.map((child) => child.text).join("") || "")
    .map((text) => text.trim())
    .filter(Boolean)
    .join("\n\n");
}

function estimateReadTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function normalizeBlog(post) {
  const content = (post.content || plainTextFromBlocks(post.body) || "").trim();

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    path: `/blogs/${post.slug}`,
    category: post.category || "Rapido Insights",
    summary: post.summary || "Read the latest Rapido Solutions Co. insight.",
    author: post.author || "Rapido Editorial",
    readTime: post.readTime || estimateReadTime(content),
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    coverImage: post.coverImage?.url ? post.coverImage : null,
    content: content || "This article is being prepared in Sanity Studio."
  };
}

async function sanityRequest(query, params = {}) {
  const url = new URL(
    `https://${sanityConfig.projectId}.api.sanity.io/v${sanityConfig.apiVersion}/data/query/${sanityConfig.dataset}`
  );
  url.searchParams.set("query", query);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  });

  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok || data?.error) {
    throw new Error(data?.error?.description || data?.message || "Sanity blog request failed.");
  }

  return data.result;
}

export function listSanityBlogs() {
  return sanityRequest(`*[_type == "post" && ${publishedFilter}] | order(coalesce(publishedAt, _createdAt) desc) ${blogFields}`)
    .then((posts) => ({ blogs: posts.map(normalizeBlog) }));
}

export function getSanityBlog(slug) {
  return sanityRequest(`*[_type == "post" && slug.current == $slug && ${publishedFilter}][0] ${blogFields}`, { slug })
    .then((post) => {
      if (!post) {
        const error = new Error("Blog post not found.");
        error.status = 404;
        throw error;
      }

      return { blog: normalizeBlog(post) };
    });
}

export const sanityStudioUrl = sanityConfig.studioUrl;
