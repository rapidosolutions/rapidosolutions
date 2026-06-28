export const navLinks = [
  { label: "Home", path: "/" },
  {
    label: "Services",
    path: "/web-services",
    children: [
      { label: "Web Services", path: "/web-services" },
      { label: "Financial Services", path: "/financial-services" },
      { label: "Human Resource Services", path: "/human-resource-services" }
    ]
  },
  {
    label: "Projects",
    path: "/projects",
    children: [
      { label: "Web Projects", path: "/projects?type=web" },
      { label: "Financial Projects", path: "/projects?type=financial" },
      { label: "Human Resource Projects", path: "/projects?type=human" }
    ]
  },
  { label: "About", path: "/about" },
  { label: "Blogs", path: "/blogs" },
  { label: "Contact", path: "/contact" }
];
