import bookkeepingWorkflowCover from "../assets/projects/bookkeeping-workflow-setup.jpg";
import localServiceCover from "../assets/projects/local-service-business-website.jpg";
import productUxCover from "../assets/projects/product-page-ux-upgrade.jpg";
import propertyAccountingCover from "../assets/projects/property-accounting-cleanup.jpg";
import realEstateCover from "../assets/projects/real-estate-showcase.jpg";
import restaurantCover from "../assets/projects/restaurant-ordering-website.jpg";
import saasCover from "../assets/projects/saas-growth-landing-page.jpg";
import shopifyCover from "../assets/projects/shopify-skincare-store.jpg";
import seoCover from "../assets/projects/technical-seo-cleanup.jpg";
import wordpressCover from "../assets/projects/wordpress-business-website.jpg";
import talentAcquisitionCover from "../assets/projects/talent-acquisition-workflow.jpg";
import hrPolicyCover from "../assets/projects/hr-policy-and-sop-setup.jpg";
import trainingCover from "../assets/projects/training-and-development-plan.jpg";

export const projectCategories = [
  "All",
  "Financial Projects",
  "Human Resource Projects",
  "Shopify Stores",
  "WordPress Websites",
  "Business Websites",
  "Restaurant Websites",
  "Real Estate Websites",
  "SaaS Landing Pages",
  "UI/UX Improvements",
  "SEO/Performance Projects"
];

export const projects = [
  {
    title: "Shopify Skincare Store",
    type: "web",
    category: "Shopify Stores",
    subCategory: "E-Commerce",
    projectUrl: "https://skincare-demo.rapidosolutions.com",
    description:
      "A clean product-led store concept with stronger product storytelling, mobile-first buying flow, and trust sections.",
    services: ["Shopify", "UI/UX", "Conversion"],
    metric: "Cleaner purchase journey",
    coverImage: shopifyCover,
    galleryImages: [productUxCover, saasCover],
    coverAlt: "A Shopify-style ecommerce store being edited on a laptop",
    accent: "from-slate-200 to-blue-400"
  },
  {
    title: "Restaurant Ordering Website",
    type: "web",
    category: "Restaurant Websites",
    subCategory: "Online Ordering",
    projectUrl: "https://restaurant-menu.rapidosolutions.com",
    description:
      "A local restaurant experience with menu highlights, reservation CTA, location details, and fast mobile navigation.",
    services: ["Web Design", "SEO", "Local UX"],
    metric: "Faster customer actions",
    coverImage: restaurantCover,
    galleryImages: [localServiceCover, realEstateCover],
    coverAlt: "A restaurant ordering interface open on a tablet",
    accent: "from-slate-200 to-sky-300"
  },
  {
    title: "Real Estate Showcase",
    type: "web",
    category: "Real Estate Websites",
    subCategory: "Property Listings",
    projectUrl: "https://estate-showcase.rapidosolutions.com",
    description:
      "A premium property presentation concept with lead capture, neighborhood context, and trust-building pages.",
    services: ["Web Development", "Lead Flow", "Brand"],
    metric: "Stronger property trust",
    coverImage: realEstateCover,
    galleryImages: [localServiceCover, shopifyCover],
    coverAlt: "A modern home suitable for a real estate showcase website",
    accent: "from-blue-100 to-emerald-300"
  },
  {
    title: "SaaS Growth Landing Page",
    type: "web",
    category: "SaaS Landing Pages",
    subCategory: "Conversion Landing",
    projectUrl: "https://saas-growth.rapidosolutions.com",
    description:
      "A conversion-focused landing page with segmented proof, product visuals, pricing CTA, and onboarding flow.",
    services: ["Landing Page", "Copy", "Analytics"],
    metric: "Sharper trial intent",
    coverImage: saasCover,
    galleryImages: [productUxCover, seoCover],
    coverAlt: "A digital analytics dashboard shown on a laptop screen",
    accent: "from-blue-200 to-cyan-300"
  },
  {
    title: "Local Service Business Website",
    type: "web",
    category: "Business Websites",
    subCategory: "Lead Generation",
    projectUrl: "https://local-services.rapidosolutions.com",
    description:
      "A practical service website designed around quote requests, service area SEO, reviews, and call conversions.",
    services: ["Web Development", "SEO", "Maintenance"],
    metric: "More lead paths",
    coverImage: localServiceCover,
    galleryImages: [restaurantCover, wordpressCover],
    coverAlt: "A business planning session with laptops and notes",
    accent: "from-slate-200 to-blue-300"
  },
  {
    title: "WordPress Business Website",
    type: "web",
    category: "WordPress Websites",
    subCategory: "CMS & Performance",
    projectUrl: "https://wordpress-demo.rapidosolutions.com",
    description:
      "A flexible WordPress website concept with service hubs, blog-ready structure, and simple page management.",
    services: ["WordPress", "Elementor", "Performance"],
    metric: "Easy content updates",
    coverImage: wordpressCover,
    galleryImages: [seoCover, localServiceCover],
    coverAlt: "WordPress development code displayed on a laptop screen",
    accent: "from-indigo-200 to-blue-300"
  },
  {
    title: "Product Page UX Upgrade",
    type: "web",
    category: "UI/UX Improvements",
    subCategory: "CRO Redesign",
    projectUrl: "https://ux-upgrade.rapidosolutions.com",
    description:
      "A before-and-after product detail layout focused on clearer benefits, stronger CTAs, and review visibility.",
    services: ["UX Review", "CRO", "Shopify"],
    metric: "Reduced friction",
    coverImage: productUxCover,
    galleryImages: [shopifyCover, saasCover],
    coverAlt: "A UX wireframe and product layout planning session",
    accent: "from-cyan-100 to-emerald-300"
  },
  {
    title: "Technical SEO Cleanup",
    type: "web",
    category: "SEO/Performance Projects",
    subCategory: "Site Hygiene",
    projectUrl: "https://seo-audit.rapidosolutions.com",
    description:
      "A search-ready website structure with metadata improvements, better headings, internal links, and speed hygiene.",
    services: ["Technical SEO", "Performance", "Content Structure"],
    metric: "Improved crawl clarity",
    coverImage: seoCover,
    galleryImages: [wordpressCover, saasCover],
    coverAlt: "Website analytics charts used for SEO and performance review",
    accent: "from-blue-100 to-sky-300"
  },
  {
    title: "Property Accounting Cleanup",
    type: "financial",
    category: "Financial Projects",
    subCategory: "Ledger Reconciliations",
    projectUrl: "https://property-finance.rapidosolutions.com",
    description:
      "A finance operations project focused on reconciliations, owner statement clarity, reporting routines, and cleaner property ledgers.",
    services: ["Bookkeeping", "Property Accounting", "Reporting"],
    metric: "Cleaner month-end visibility",
    coverImage: propertyAccountingCover,
    galleryImages: [bookkeepingWorkflowCover],
    coverAlt: "Property finance planning with house models and cash",
    accent: "from-emerald-100 to-blue-200"
  },
  {
    title: "Bookkeeping Workflow Setup",
    type: "financial",
    category: "Financial Projects",
    subCategory: "Cloud Accounting",
    projectUrl: "https://bookkeeping-ops.rapidosolutions.com",
    description:
      "A structured bookkeeping support direction for businesses that need organized transactions, AR/AP tracking, and reporting readiness.",
    services: ["Bookkeeping", "AR/AP", "Reconciliations"],
    metric: "More organized records",
    coverImage: bookkeepingWorkflowCover,
    galleryImages: [propertyAccountingCover],
    coverAlt: "A bookkeeping desk with calculator, reports, and laptop",
    accent: "from-slate-100 to-emerald-200"
  },
  {
    title: "Talent Acquisition Workflow",
    type: "human",
    category: "Human Resource Projects",
    subCategory: "Recruitment Pipeline",
    projectUrl: "https://talent-pipeline.rapidosolutions.com",
    description:
      "A hiring process structure for screening, shortlisting, interview stages, and clearer candidate communication.",
    services: ["Talent Acquisition", "Hiring Flow", "Screening"],
    metric: "Clearer hiring pipeline",
    coverImage: talentAcquisitionCover,
    galleryImages: [hrPolicyCover, trainingCover],
    coverAlt: "Human resource hiring workflow concept with candidate profiles and interview schedule",
    accent: "from-blue-100 to-indigo-300"
  },
  {
    title: "HR Policy and SOP Setup",
    type: "human",
    category: "Human Resource Projects",
    subCategory: "Corporate Documentation",
    projectUrl: "https://hr-policies.rapidosolutions.com",
    description:
      "A documentation project for core workplace policies, role responsibilities, approvals, and repeatable operating procedures.",
    services: ["Policies", "SOPs", "Documentation"],
    metric: "Consistent team process",
    coverImage: hrPolicyCover,
    galleryImages: [talentAcquisitionCover, trainingCover],
    coverAlt: "Human resource policy documentation and corporate SOP handbook concept",
    accent: "from-slate-100 to-sky-300"
  },
  {
    title: "Training and Development Plan",
    type: "human",
    category: "Human Resource Projects",
    subCategory: "Staff Onboarding",
    projectUrl: "https://training-ops.rapidosolutions.com",
    description:
      "An employee development direction for onboarding, skills training, manager check-ins, and team learning routines.",
    services: ["Training", "Onboarding", "Development"],
    metric: "Stronger team readiness",
    coverImage: trainingCover,
    galleryImages: [hrPolicyCover, talentAcquisitionCover],
    coverAlt: "Employee training and development workshop session in progress",
    accent: "from-emerald-100 to-blue-300"
  },
  {
    title: "Luxury Real Estate Showcase Portal",
    type: "web",
    category: "Real Estate Websites",
    subCategory: "Luxury Brokerage",
    projectUrl: "https://luxury-villas.rapidosolutions.com",
    description:
      "A premium property presentation and broker lead-generation concept with high-resolution visual showcases, interactive neighborhood guides, and private viewing booking flow.",
    services: ["Web Development", "Lead Flow", "Brand", "UI/UX"],
    metric: "65% more verified lead tours",
    coverImage: realEstateCover,
    galleryImages: [localServiceCover, restaurantCover],
    coverAlt: "Luxury modern home suitable for a real estate showcase website",
    accent: "from-blue-100 to-emerald-300"
  }
];
