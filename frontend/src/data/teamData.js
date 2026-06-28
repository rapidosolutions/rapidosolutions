import samarKhanImage from "../assets/team/samar-khan.jpg";
import sabaNadeemImage from "../assets/team/saba-nadeem.jpg";
import zunairAhmedKhanImage from "../assets/team/zunair-ahmed-khan.png";
import imranBashirImage from "../assets/team/m-imran-bashir.png";

export const teamMembers = [
  {
    name: "Muhammad Huzaifa",
    role: "Founder",
    initials: "MH",
    icon: "FiTarget",
    summary: "Leads company direction, client trust, service standards, and long-term growth planning.",
    expertise: ["Strategy", "Growth", "Leadership"]
  },
  {
    name: "Hamza Tufail",
    role: "Chief Operating Officer",
    initials: "HT",
    icon: "FiActivity",
    summary: "Supports operations, delivery coordination, internal systems, and service quality across projects.",
    expertise: ["Operations", "Delivery", "Systems"]
  },
  {
    name: "M. Imran Bashir",
    role: "Manager Operational Analyst",
    image: imranBashirImage,
    imagePosition: "center 20%",
    initials: "MIB",
    icon: "FiBriefcase",
    summary: "Manages operations, bookkeeping records, documentation, contracts, databases, and confidentiality.",
    expertise: ["Operations", "Bookkeeping", "Contracts"]
  },
  {
    name: "Samar Khan",
    role: "Software Engineer",
    image: samarKhanImage,
    initials: "SK",
    icon: "FiCode",
    summary: "Builds responsive web experiences, service pages, and digital growth systems.",
    expertise: ["Full Stack Development", "React", "Web Performance"]
  },
  {
    name: "Saba Nadeem",
    role: "Business Development Officer",
    image: sabaNadeemImage,
    imagePosition: "center center",
    initials: "SN",
    icon: "FiTrendingUp",
    summary: "Builds client relationships, coordinates outreach, and supports business development.",
    expertise: ["Business Development", "Client Relations", "Growth Strategy"]
  },
  {
    name: "Zunair Ahmed Khan",
    role: "Graphics Designer",
    image: zunairAhmedKhanImage,
    imageFit: "contain",
    imageClass: "p-8 sm:p-10",
    initials: "ZAK",
    icon: "FiPenTool",
    summary: "Creates visual design, UX/UI, web design, branding, logos, and social media assets.",
    expertise: ["Graphic Design", "UX/UI Design", "Branding"]
  }
];
