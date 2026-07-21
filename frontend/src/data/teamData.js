import hashimRazaImage from "../assets/team/hashim-raza-1200.jpg";
import muhammadHuzaifaImage from "../assets/team/muhammad-huzaifa-1200.jpg";
import shehzadAmirImage from "../assets/team/shehzad-amir-1200.jpg";
import samarKhanImage from "../assets/team/samar-khan-1200.jpg";
import jawadSadatAliImage from "../assets/team/jawad-sadat-ali-1200.jpg";
import imranBashirImage from "../assets/team/imran-bashir-1200.jpg";
import hamzaTufailImage from "../assets/team/hamza-tufail-1200.jpg";
import munimSohailImage from "../assets/team/munim-sohail-1200.jpg";
import zunairAhmedKhanImage from "../assets/team/zunair-ahmed-khan-1200.jpg";
import sabaNadeemImage from "../assets/team/saba-nadeem-1200.jpg";

import afFergusonLogo from "../assets/team/companies/af-ferguson.jfif";
import careemLogo from "../assets/team/companies/careem.jfif";
import combinedFabricsLogo from "../assets/team/companies/combined-fabrics.jfif";
import etihadAlloysLogo from "../assets/team/companies/etihad-alloys.jfif";
import fazalGroupLogo from "../assets/team/companies/fazal-group.jfif";
import i2cLogo from "../assets/team/companies/i2c.jfif";
import lahoreLeadsLogo from "../assets/team/companies/lahore-leads-university.jfif";
import merakiLogo from "../assets/team/companies/meraki-partnership.jfif";
import osoolLogo from "../assets/team/companies/osool.jfif";
import ptclLogo from "../assets/team/companies/ptcl.jfif";
import pureLogicsLogo from "../assets/team/companies/purelogics.jfif";
import rapidoLogo from "../assets/team/companies/rapido-solutions.jpg";
import synetLogo from "../assets/team/companies/synet.jfif";
import turnkeyLogo from "../assets/team/companies/turnkey-associates.jfif";
import unitFactorLogo from "../assets/team/companies/unitfactor.jfif";

const company = (name, logo) => ({ name, logo });

export const teamGroups = [
  {
    id: "finance",
    title: "Finance",
    icon: "FiPieChart",
    members: [
      {
        name: "Hashim Raza",
        image: hashimRazaImage,
        imagePosition: "center",
        initials: "HR",
        summary: "Strengthens reporting, controls, and dependable accounting support for growing organizations.",
        expertise: ["CPA", "Reporting", "Controls"],
        linkedinUrl: "https://www.linkedin.com/in/hashim-raza-900115114/",
        workedAt: [
          company("The Meraki Partnership LLP", merakiLogo),
          company("Osool Integrated Real Estate Co.", osoolLogo),
          company("A. F. Ferguson & Co.", afFergusonLogo)
        ]
      },
      {
        name: "Muhammad Huzaifa",
        image: muhammadHuzaifaImage,
        imagePosition: "center",
        initials: "MH",
        summary: "Guides company direction, client trust, service standards, and long-term growth planning.",
        expertise: ["Strategy", "Growth", "Leadership"],
        linkedinUrl: "https://www.linkedin.com/in/muhammad-huzaifa-3740a917b/",
        workedAt: [company("i2c Inc.", i2cLogo), company("PTCL Official", ptclLogo), company("TurnKey Associates PK", turnkeyLogo)]
      }
    ]
  },
  {
    id: "technology",
    title: "Technology",
    icon: "FiCode",
    members: [
      {
        name: "Shehzad Amir",
        image: shehzadAmirImage,
        imagePosition: "center",
        initials: "SA",
        summary: "Leads web architecture, engineering quality, and dependable technical delivery for client projects.",
        expertise: ["Architecture", "Full Stack", "Leadership"],
        linkedinUrl: "https://www.linkedin.com/in/shahzad-amir-4520b4198/",
        workedAt: [company("Careem", careemLogo)]
      },
      {
        name: "Samar Khan",
        image: samarKhanImage,
        imagePosition: "center",
        initials: "SK",
        summary: "Builds responsive web experiences, service platforms, and reliable digital growth systems.",
        expertise: ["Full Stack", "React", "Performance"],
        linkedinUrl: "https://www.linkedin.com/in/samarkhan56/",
        workedAt: [company("Rapido Solutions Co.", rapidoLogo)]
      }
    ]
  },
  {
    id: "human-resources",
    title: "Human Resources",
    icon: "FiUsers",
    members: [
      {
        name: "Jawad Sadat Ali",
        image: jawadSadatAliImage,
        imagePosition: "center",
        initials: "JSA",
        summary: "Supports talent strategy, people operations, workplace policies, and team development.",
        expertise: ["Talent", "People Ops", "Development"],
        linkedinUrl: "https://www.linkedin.com/in/jawad-saadat-ali-883b5a5b/",
        workedAt: [
          company("Fazal Group", fazalGroupLogo),
          company("Etihad Alloys (Pvt.) Ltd.", etihadAlloysLogo),
          company("Combined Fabrics Limited", combinedFabricsLogo)
        ]
      },
      {
        name: "M. Imran Bashir",
        image: imranBashirImage,
        imagePosition: "center",
        initials: "MIB",
        summary: "Coordinates operations, records, documentation, contracts, databases, and confidential workflows.",
        expertise: ["Operations", "Records", "Contracts"],
        linkedinUrl: "https://www.linkedin.com/in/mimranbashir16/",
        workedAt: [
          company("SyNet Digital", synetLogo),
          company("PureLogics", pureLogicsLogo),
          company("Combined Fabrics Limited", combinedFabricsLogo)
        ]
      }
    ]
  },
  {
    id: "operations",
    title: "Operations",
    icon: "FiBriefcase",
    members: [
      {
        name: "Hamza Tufail",
        image: hamzaTufailImage,
        imagePosition: "center",
        initials: "HT",
        summary: "Keeps service delivery, internal coordination, and day-to-day business operations running smoothly.",
        expertise: ["Operations", "Delivery", "Coordination"],
        linkedinUrl: "",
        workedAt: [company("Rapido Solutions Co.", rapidoLogo)]
      },
      {
        name: "Munim Sohail",
        image: munimSohailImage,
        imagePosition: "center",
        initials: "MS",
        summary: "Supports organized execution, team coordination, and consistent operational follow-through.",
        expertise: ["Execution", "Coordination", "Support"],
        linkedinUrl: "",
        workedAt: [company("Rapido Solutions Co.", rapidoLogo)]
      }
    ]
  },
  {
    id: "design-ui-ux",
    title: "Design – UI/UX",
    icon: "FiPenTool",
    members: [
      {
        name: "Zunair Ahmed Khan",
        image: zunairAhmedKhanImage,
        imageFit: "contain",
        imageClass: "p-8 sm:p-10",
        initials: "ZAK",
        summary: "Creates focused visual systems across UX/UI, web design, branding, and digital content.",
        expertise: ["Graphic Design", "UX/UI", "Branding"],
        linkedinUrl: "",
        workedAt: [company("Rapido Solutions Co.", rapidoLogo)]
      }
    ]
  },
  {
    id: "business-development",
    title: "Business Development",
    icon: "FiTrendingUp",
    members: [
      {
        name: "Saba Nadeem",
        image: sabaNadeemImage,
        imagePosition: "center",
        initials: "SN",
        summary: "Builds client relationships, coordinates outreach, and identifies practical growth opportunities.",
        expertise: ["Development", "Relations", "Growth"],
        linkedinUrl: "https://www.linkedin.com/in/saba-naeem-199293b3/",
        workedAt: [
          company("Rapido Solutions Co.", rapidoLogo),
          company("UnitFactor", unitFactorLogo),
          company("Lahore Leads University", lahoreLeadsLogo)
        ]
      }
    ]
  }
];

export const teamMembers = teamGroups.flatMap((group) => group.members);
