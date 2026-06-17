export const navLinks = [
  { label: "Home", path: "/" },
  { label: "Web Services", path: "/web-services" },
  { label: "Financial Services", path: "/financial-services" },
  {
    label: "Projects",
    path: "/projects",
    children: [
      { label: "Web Projects", path: "/projects?type=web" },
      { label: "Financial Projects", path: "/projects?type=financial" }
    ]
  },
  { label: "Blogs", path: "/blogs" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" }
];
