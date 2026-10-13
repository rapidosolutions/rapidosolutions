import { assertDatabaseResult } from "../utils/database.js";
import { AppError, slugify } from "../utils/http.js";

function serialize(value, includeAdmin = false) {
  const project = {
    id: String(value.id),
    title: value.title,
    slug: value.slug,
    type: value.type,
    category: value.category,
    subCategory: value.sub_category || value.subCategory || "",
    description: value.description,
    services: value.services || [],
    metric: value.metric,
    coverImage: value.cover_image?.url ? value.cover_image : null,
    galleryImages: Array.isArray(value.gallery_images) ? value.gallery_images : Array.isArray(value.galleryImages) ? value.galleryImages : [],
    coverAlt: value.cover_alt,
    accent: value.accent,
    projectUrl:
      value.project_url ||
      value.projectUrl ||
      `https://${(value.slug || (value.title ? slugify(value.title) : "") || "demo").toLowerCase()}.rapidosolutions.com`,
    featured: Boolean(value.featured),
    displayOrder: value.display_order,
    publishedAt: value.published_at,
    updatedAt: value.updated_at
  };
  if (includeAdmin) {
    project.status = value.status;
    project.seoTitle = value.seo_title;
    project.seoDescription = value.seo_description;
    project.createdAt = value.created_at;
  }
  return project;
}

async function uniqueSlug(supabase, title, requestedSlug, excludeId) {
  const base = slugify(requestedSlug || title) || `project-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (true) {
    let query = supabase.from("projects").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    assertDatabaseResult(error, "Project slug could not be checked.");
    if (!data?.length) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

function databaseInput(input) {
  return {
    title: input.title,
    slug: input.slug,
    type: input.type,
    category: input.category,
    sub_category: input.subCategory || "",
    description: input.description,
    services: input.services,
    metric: input.metric,
    cover_image: input.coverImage || null,
    gallery_images: Array.isArray(input.galleryImages) ? input.galleryImages : [],
    cover_alt: input.coverAlt,
    accent: input.accent || "from-slate-200 to-blue-400",
    project_url: input.projectUrl || "",
    featured: input.featured,
    display_order: input.displayOrder,
    status: input.status,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    published_at: input.status === "published" ? new Date().toISOString() : null
  };
}

export function createProjectService({ supabase, uploadService }) {
  // In-memory fallback for local development without Supabase
  let localProjects = [
    {
      id: "seed-proj-1",
      title: "Shopify Skincare Store",
      slug: "shopify-skincare-store",
      type: "web",
      category: "Shopify Stores",
      description: "A clean product-led store concept with stronger product storytelling, mobile-first buying flow, and trust sections.",
      services: ["Shopify", "UI/UX", "Conversion"],
      metric: "Cleaner purchase journey",
      cover_image: null,
      cover_alt: "A Shopify-style ecommerce store being edited on a laptop",
      accent: "from-slate-200 to-blue-400",
      project_url: "https://skincare-demo.rapidosolutions.com",
      featured: true,
      display_order: 1,
      status: "published",
      seo_title: "Shopify Skincare Store | Rapido Projects",
      seo_description: "A clean product-led store concept with stronger product storytelling.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-2",
      title: "Restaurant Ordering Website",
      slug: "restaurant-ordering-website",
      type: "web",
      category: "Restaurant Websites",
      description: "A local restaurant experience with menu highlights, reservation CTA, location details, and fast mobile navigation.",
      services: ["Web Design", "SEO", "Local UX"],
      metric: "Faster customer actions",
      cover_image: null,
      cover_alt: "A restaurant ordering interface open on a tablet",
      accent: "from-slate-200 to-sky-300",
      project_url: "https://restaurant-menu.rapidosolutions.com",
      featured: false,
      display_order: 2,
      status: "published",
      seo_title: "Restaurant Ordering Website | Rapido Projects",
      seo_description: "A local restaurant experience with menu highlights and reservation CTA.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-3",
      title: "Real Estate Showcase",
      slug: "real-estate-showcase",
      type: "web",
      category: "Real Estate Websites",
      description: "A premium property presentation concept with lead capture, neighborhood context, and trust-building pages.",
      services: ["Web Development", "Lead Flow", "Brand"],
      metric: "Stronger property trust",
      cover_image: null,
      cover_alt: "A modern home suitable for a real estate showcase website",
      accent: "from-blue-100 to-emerald-300",
      project_url: "https://estate-showcase.rapidosolutions.com",
      featured: false,
      display_order: 3,
      status: "published",
      seo_title: "Real Estate Showcase | Rapido Projects",
      seo_description: "A premium property presentation concept with lead capture.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-4",
      title: "SaaS Growth Landing Page",
      slug: "saas-growth-landing-page",
      type: "web",
      category: "SaaS Landing Pages",
      description: "A conversion-focused landing page with segmented proof, product visuals, pricing CTA, and onboarding flow.",
      services: ["Landing Page", "Copy", "Analytics"],
      metric: "Sharper trial intent",
      cover_image: null,
      cover_alt: "A digital analytics dashboard shown on a laptop screen",
      accent: "from-blue-200 to-cyan-300",
      project_url: "https://saas-growth.rapidosolutions.com",
      featured: false,
      display_order: 4,
      status: "published",
      seo_title: "SaaS Growth Landing Page | Rapido Projects",
      seo_description: "A conversion-focused landing page with segmented proof.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-5",
      title: "Local Service Business Website",
      slug: "local-service-business-website",
      type: "web",
      category: "Business Websites",
      description: "A practical service website designed around quote requests, service area SEO, reviews, and call conversions.",
      services: ["Web Development", "SEO", "Maintenance"],
      metric: "More lead paths",
      cover_image: null,
      cover_alt: "A business planning session with laptops and notes",
      accent: "from-slate-200 to-blue-300",
      project_url: "https://local-services.rapidosolutions.com",
      featured: false,
      display_order: 5,
      status: "published",
      seo_title: "Local Service Business Website | Rapido Projects",
      seo_description: "A practical service website designed around quote requests.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-6",
      title: "WordPress Business Website",
      slug: "wordpress-business-website",
      type: "web",
      category: "WordPress Websites",
      description: "A flexible WordPress website concept with service hubs, blog-ready structure, and simple page management.",
      services: ["WordPress", "Elementor", "Performance"],
      metric: "Easy content updates",
      cover_image: null,
      cover_alt: "WordPress development code displayed on a laptop screen",
      accent: "from-indigo-200 to-blue-300",
      project_url: "https://wordpress-demo.rapidosolutions.com",
      featured: false,
      display_order: 6,
      status: "published",
      seo_title: "WordPress Business Website | Rapido Projects",
      seo_description: "A flexible WordPress website concept with service hubs.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-7",
      title: "Product Page UX Upgrade",
      slug: "product-page-ux-upgrade",
      type: "web",
      category: "UI/UX Improvements",
      description: "A before-and-after product detail layout focused on clearer benefits, stronger CTAs, and review visibility.",
      services: ["UX Review", "CRO", "Shopify"],
      metric: "Reduced friction",
      cover_image: null,
      cover_alt: "A UX wireframe and product layout planning session",
      accent: "from-cyan-100 to-emerald-300",
      project_url: "https://ux-upgrade.rapidosolutions.com",
      featured: false,
      display_order: 7,
      status: "published",
      seo_title: "Product Page UX Upgrade | Rapido Projects",
      seo_description: "A before-and-after product detail layout focused on clearer benefits.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-8",
      title: "Technical SEO Cleanup",
      slug: "technical-seo-cleanup",
      type: "web",
      category: "SEO/Performance Projects",
      description: "A search-ready website structure with metadata improvements, better headings, internal links, and speed hygiene.",
      services: ["Technical SEO", "Performance", "Content Structure"],
      metric: "Improved crawl clarity",
      cover_image: null,
      cover_alt: "Website analytics charts used for SEO and performance review",
      accent: "from-blue-100 to-sky-300",
      project_url: "https://seo-audit.rapidosolutions.com",
      featured: false,
      display_order: 8,
      status: "published",
      seo_title: "Technical SEO Cleanup | Rapido Projects",
      seo_description: "A search-ready website structure with metadata improvements.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-9",
      title: "Property Accounting Cleanup",
      slug: "property-accounting-cleanup",
      type: "financial",
      category: "Financial Projects",
      description: "A finance operations project focused on reconciliations, owner statement clarity, reporting routines, and cleaner property ledgers.",
      services: ["Bookkeeping", "Property Accounting", "Reporting"],
      metric: "Cleaner month-end visibility",
      cover_image: null,
      cover_alt: "Property finance planning with house models and cash",
      accent: "from-emerald-100 to-blue-200",
      project_url: "",
      featured: false,
      display_order: 9,
      status: "published",
      seo_title: "Property Accounting Cleanup | Rapido Projects",
      seo_description: "A finance operations project focused on reconciliations and owner statement clarity.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-10",
      title: "Bookkeeping Workflow Setup",
      slug: "bookkeeping-workflow-setup",
      type: "financial",
      category: "Financial Projects",
      description: "A structured bookkeeping support direction for businesses that need organized transactions, AR/AP tracking, and reporting readiness.",
      services: ["Bookkeeping", "AR/AP", "Reconciliations"],
      metric: "More organized records",
      cover_image: null,
      cover_alt: "A bookkeeping desk with calculator, reports, and laptop",
      accent: "from-slate-100 to-emerald-200",
      project_url: "",
      featured: false,
      display_order: 10,
      status: "published",
      seo_title: "Bookkeeping Workflow Setup | Rapido Projects",
      seo_description: "A structured bookkeeping support direction for businesses.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-11",
      title: "Talent Acquisition Workflow",
      slug: "talent-acquisition-workflow",
      type: "human",
      category: "Human Resource Projects",
      description: "A hiring process structure for screening, shortlisting, interview stages, and clearer candidate communication.",
      services: ["Talent Acquisition", "Hiring Flow", "Screening"],
      metric: "Clearer hiring pipeline",
      cover_image: null,
      cover_alt: "Human resource hiring workflow concept",
      accent: "from-blue-100 to-indigo-300",
      project_url: "",
      featured: false,
      display_order: 11,
      status: "published",
      seo_title: "Talent Acquisition Workflow | Rapido Projects",
      seo_description: "A hiring process structure for screening and shortlisting.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-12",
      title: "HR Policy and SOP Setup",
      slug: "hr-policy-and-sop-setup",
      type: "human",
      category: "Human Resource Projects",
      description: "A documentation project for core workplace policies, role responsibilities, approvals, and repeatable operating procedures.",
      services: ["Policies", "SOPs", "Documentation"],
      metric: "Consistent team process",
      cover_image: null,
      cover_alt: "Human resource policy documentation concept",
      accent: "from-slate-100 to-sky-300",
      project_url: "",
      featured: false,
      display_order: 12,
      status: "published",
      seo_title: "HR Policy and SOP Setup | Rapido Projects",
      seo_description: "A documentation project for core workplace policies and SOPs.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-13",
      title: "Training and Development Plan",
      slug: "training-and-development-plan",
      type: "human",
      category: "Human Resource Projects",
      description: "An employee development direction for onboarding, skills training, manager check-ins, and team learning routines.",
      services: ["Training", "Onboarding", "Development"],
      metric: "Stronger team readiness",
      cover_image: null,
      cover_alt: "Employee training and development planning concept",
      accent: "from-emerald-100 to-blue-300",
      project_url: "",
      featured: false,
      display_order: 13,
      status: "published",
      seo_title: "Training and Development Plan | Rapido Projects",
      seo_description: "An employee development direction for onboarding and skills training.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed-proj-14",
      title: "Luxury Real Estate Showcase Portal",
      slug: "luxury-real-estate-showcase-portal",
      type: "web",
      category: "Real Estate Websites",
      description: "A premium property presentation and broker lead-generation concept with high-resolution visual showcases, interactive neighborhood guides, and private viewing booking flow.",
      services: ["Web Development", "Lead Flow", "Brand", "UI/UX"],
      metric: "65% more verified lead tours",
      cover_image: null,
      cover_alt: "Luxury modern home suitable for a real estate showcase website",
      accent: "from-blue-100 to-emerald-300",
      project_url: "",
      featured: true,
      display_order: 14,
      status: "published",
      seo_title: "Luxury Real Estate Showcase Portal | Rapido Projects",
      seo_description: "A premium property presentation and broker lead-generation concept with high-resolution visual showcases.",
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return {
    async listPublic() {
      if (!supabase) {
        return localProjects
          .filter((p) => p.status === "published")
          .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.display_order - b.display_order)
          .map((value) => serialize(value));
      }
      const { data, error } = await supabase.from("projects").select("*").eq("status", "published")
        .order("featured", { ascending: false }).order("display_order", { ascending: true }).order("created_at", { ascending: true });
      assertDatabaseResult(error, "Projects could not be loaded.");
      return (data || []).map((value) => serialize(value));
    },
    async getPublic(slug) {
      if (!supabase) {
        const item = localProjects.find((p) => p.slug === slug && p.status === "published");
        if (!item) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
        return serialize(item);
      }
      const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      assertDatabaseResult(error, "Project could not be loaded.");
      if (!data) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      return serialize(data);
    },
    async listAdmin() {
      if (!supabase) {
        return [...localProjects]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .map((value) => serialize(value, true));
      }
      const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
      assertDatabaseResult(error, "Projects could not be loaded.");
      return (data || []).map((value) => serialize(value, true));
    },
    async getAdmin(id) {
      if (!supabase) {
        const item = localProjects.find((p) => p.id === id);
        if (!item) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
        return serialize(item, true);
      }
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      assertDatabaseResult(error, "Project could not be loaded.");
      if (!data) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      return serialize(data, true);
    },
    async create(input) {
      if (!supabase) {
        const baseSlug = slugify(input.slug || input.title) || `project-${Date.now()}`;
        let candidateSlug = baseSlug;
        let suffix = 2;
        while (localProjects.some((p) => p.slug === candidateSlug)) {
          candidateSlug = `${baseSlug}-${suffix++}`;
        }
        const newProject = {
          ...databaseInput({ ...input, slug: candidateSlug }),
          id: `proj-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localProjects.unshift(newProject);
        return serialize(newProject, true);
      }
      const values = databaseInput({ ...input, slug: await uniqueSlug(supabase, input.title, input.slug) });
      const { data, error } = await supabase.from("projects").insert(values).select("*").single();
      assertDatabaseResult(error, "Project could not be created.");
      return serialize(data, true);
    },
    async update(id, input) {
      if (!supabase) {
        const index = localProjects.findIndex((p) => p.id === id);
        if (index === -1) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
        const existing = localProjects[index];
        const publishedAt = input.status === "published" ? existing.published_at || new Date().toISOString() : null;
        const updated = {
          ...existing,
          ...databaseInput({ ...input, slug: input.slug || existing.slug }),
          published_at: publishedAt,
          updated_at: new Date().toISOString()
        };
        localProjects[index] = updated;
        return serialize(updated, true);
      }
      const { data: existing, error: findError } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      assertDatabaseResult(findError, "Project could not be loaded.");
      if (!existing) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      const coverImage = input.coverImage === undefined ? existing.cover_image : input.coverImage;
      const publishedAt = input.status === "published" ? existing.published_at || new Date().toISOString() : null;
      const values = { ...databaseInput({ ...input, coverImage, slug: await uniqueSlug(supabase, input.title, input.slug, id) }), published_at: publishedAt };
      const { data, error } = await supabase.from("projects").update(values).eq("id", id).select("*").single();
      assertDatabaseResult(error, "Project could not be updated.");
      if (existing.cover_image?.publicId && input.coverImage !== undefined && existing.cover_image.publicId !== input.coverImage?.publicId) {
        await uploadService.remove(existing.cover_image).catch(() => undefined);
      }
      return serialize(data, true);
    },
    async updateStatus(id, status) {
      if (!supabase) {
        const index = localProjects.findIndex((p) => p.id === id);
        if (index === -1) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
        localProjects[index].status = status;
        localProjects[index].published_at = status === "published" ? new Date().toISOString() : null;
        localProjects[index].updated_at = new Date().toISOString();
        return serialize(localProjects[index], true);
      }
      const { data, error } = await supabase.from("projects").update({ status, published_at: status === "published" ? new Date().toISOString() : null })
        .eq("id", id).select("*").maybeSingle();
      assertDatabaseResult(error, "Project status could not be updated.");
      if (!data) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      return serialize(data, true);
    },
    async archive(id) {
      return this.updateStatus(id, "archived");
    },
    async remove(id, confirmationTitle) {
      if (!supabase) {
        const index = localProjects.findIndex((p) => p.id === id);
        if (index === -1) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
        if (confirmationTitle !== localProjects[index].title) {
          throw new AppError(400, "The project title confirmation does not match.", "PROJECT_DELETE_CONFIRMATION_MISMATCH");
        }
        localProjects.splice(index, 1);
        return;
      }
      const { data: existing, error: findError } = await supabase
        .from("projects")
        .select("id,title,cover_image")
        .eq("id", id)
        .maybeSingle();
      assertDatabaseResult(findError, "Project could not be loaded.");
      if (!existing) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      if (confirmationTitle !== existing.title) {
        throw new AppError(400, "The project title confirmation does not match.", "PROJECT_DELETE_CONFIRMATION_MISMATCH");
      }

      let removeCoverAfterDelete = false;
      if (existing.cover_image?.publicId) {
        const { data: sharedCoverReferences, error: ownershipError } = await supabase
          .from("projects")
          .select("id")
          .neq("id", existing.id)
          .eq("cover_image->>publicId", existing.cover_image.publicId)
          .limit(1);
        removeCoverAfterDelete = !ownershipError && !sharedCoverReferences?.length;
      }

      const { data: deleted, error } = await supabase
        .from("projects")
        .delete()
        .eq("id", existing.id)
        .select("id")
        .maybeSingle();
      assertDatabaseResult(error, "Project could not be deleted.");
      if (!deleted) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");

      if (removeCoverAfterDelete) {
        await uploadService.remove(existing.cover_image).catch(() => undefined);
      }
    }
  };
}
