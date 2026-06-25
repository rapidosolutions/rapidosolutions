import samarKhanImage from "../assets/team/samar-khan.jpg";
import sabaNadeemImage from "../assets/team/saba-nadeem.jpg";
import zunairAhmedKhanImage from "../assets/team/zunair-ahmed-khan.png";
import imranBashirImage from "../assets/team/m-imran-bashir.png";

export const teamMembers = [
  {
    name: "M. Imran Bashir",
    role: "Manager Operational Analyst",
    image: imranBashirImage,
    imagePosition: "center 20%",
    initials: "MIB",
    icon: "FiBriefcase",
    summary:
      "Manages company operations, client bookkeeping and financial records, contracts, documentation, databases, and confidential information.",
    expertise: ["Operations", "Bookkeeping", "Contracts", "Database Management", "Confidentiality"]
  },
  {
    name: "Saba Nadeem",
    role: "Business Development Officer",
    image: sabaNadeemImage,
    imagePosition: "center center",
    initials: "SN",
    icon: "FiTrendingUp",
    summary:
      "Builds client relationships, identifies growth opportunities, coordinates outreach, and supports business development initiatives.",
    expertise: ["Business Development", "Client Relations", "Growth Strategy"]
  },
  {
    name: "Samar Khan",
    role: "Software Engineer",
    image: samarKhanImage,
    initials: "SK",
    icon: "FiCode",
    summary:
      "Builds clean, responsive, and performance-focused web experiences for business websites, service pages, and digital growth systems.",
    expertise: ["Full Stack Development", "React", "Web Performance"]
  },
  {
    name: "Zunair Ahmed Khan",
    role: "Graphics Designer",
    image: zunairAhmedKhanImage,
    imageFit: "contain",
    imageClass: "p-8 sm:p-10",
    initials: "ZAK",
    icon: "FiPenTool",
    summary:
      "Creates graphic design, UX/UI, web design, branding, logo, and social media work that keeps visual communication clear and consistent.",
    expertise: ["Graphic Design", "UX/UI Design", "Web Design", "Branding & Logos", "Social Media"]
  }
];
