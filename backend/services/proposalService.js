import { AppError } from "../utils/http.js";

// Initial seed proposals matching the client's reference document
const defaultProposalData = [
  {
    id: "prop-delivery-mgmt",
    title: "Delivery Management System + Web App",
    eyebrow: "WEB & DELIVERY TECHNOLOGY PROPOSAL",
    subtitle: "2 Courier Websites | 2 Admin Panels | Web App",
    status: "ready",
    companyDetails: {
      preparedBy: "Rapido Solutions Co.",
      preparedFor: "Mr. Arshad",
      date: "September 2026",
      upworkUrl: "https://www.upwork.com/agencies/rapidosolutions/",
      companyUrl: "https://rapidosolutions.com",
      footerReference: "Rapido Solutions Co. | Delivery Management System Proposal"
    },
    sections: [
      {
        id: "sec-1",
        number: "1",
        title: "Project Overview",
        subtitle: "",
        contentHtml:
          "<p>Rapido Solutions Co. proposes to design and develop a complete Delivery Management System consisting of two independent courier websites and two dedicated admin/CMS panels. Both courier websites will provide the same core business functionality while using different UI/branding. Customers will be able to obtain delivery rates, book shipments, pay in advance by debit/credit card, create accounts, view order history and track orders. Administrators will manage customers, orders, payments and delivery operations from the respective CMS.</p><p class=\"mt-4\">Estimated delivery: approximately 3 months, subject to timely Client feedback, content, third-party credentials/API access and approvals.</p>",
        table: null,
        image: null,
        techStack: []
      },
      {
        id: "sec-2",
        number: "2",
        title: "Main Deliverables",
        subtitle: "",
        contentHtml: "",
        table: {
          enabled: true,
          headerColor: "#1D63ED",
          headerTextColor: "#ffffff",
          headers: ["Deliverable", "Qty.", "Description"],
          rows: [
            ["Courier Customer Websites", "02", "Same delivery functionality with different UI/branding."],
            ["Admin / CMS Panels", "02", "Dedicated order and customer management panel for each website."],
            ["Delivery Rate Calculator", "02", "Rate based on pickup, delivery, city, dimensions and configured delivery rules."],
            ["Secure Checkout", "02", "Advance debit/credit card payment through selected payment gateway."]
          ]
        },
        image: null,
        techStack: []
      },
      {
        id: "sec-3",
        number: "3",
        title: "Courier Website — Customer Modules",
        subtitle: "",
        contentHtml:
          "<ul><li>Professional responsive homepage plus Services, About, How It Works, FAQ, Contact and relevant legal/information pages.</li><li>Delivery-rate form covering pickup address, delivery address, city, package dimensions, weight and required shipment details.</li><li>Dynamic delivery-rate calculation/quotation based on configured rules and/or Client-provided courier API.</li><li>Shipment booking with pickup, delivery and package information.</li><li>Customer registration, secure login/logout and profile management.</li><li>Customer dashboard with current and previous orders.</li><li>Order history with order details, status and tracking reference.</li><li>Shipment tracking through the configured courier/API workflow where supported.</li><li>Checkout page with complete shipment summary and final payable amount.</li><li>Secure advance debit/credit card payment through the selected payment gateway.</li></ul>",
        table: null,
        image: null,
        techStack: []
      },
      {
        id: "sec-4",
        number: "4",
        title: "Admin CMS — Delivery & Order Management",
        subtitle: "",
        contentHtml:
          "<ul><li>Order confirmation and transactional email/notification workflow.</li><li>Secure administrator authentication and role-based access control.</li><li>Dashboard with order, customer, payment and delivery-status overview.</li><li>Customer management with search and order-history visibility.</li><li>Order management: search, filter, view, update and operationally manage orders.</li><li>Complete order details including pickup/delivery addresses and package dimensions/weight.</li><li>Payment status and transaction-reference visibility.</li><li>Order/shipment status management through the defined workflow.</li><li>Tracking reference/status management and courier API information where available.</li><li>Invoice/order documentation access where included in the final workflow.</li><li>Responsive CMS interface for desktop/tablet administration.</li></ul>",
        table: null,
        image: null,
        techStack: []
      },
      {
        id: "sec-5",
        number: "5",
        title: "Booking, Rate & Payment Workflow",
        subtitle: "",
        contentHtml:
          "<ol><li><strong>1. Customer enters</strong> pickup address, delivery address/city and package details.</li><li><strong>2. System validates</strong> shipment information and calculates/obtains the applicable delivery rate.</li><li><strong>3. Customer reviews</strong> shipment information, service and final price.</li><li><strong>4. Customer pays</strong> the full amount in advance using debit/credit card.</li><li><strong>5. Payment is confirmed</strong> through secure server-side payment-provider mechanisms/webhooks.</li><li><strong>6. Confirmed order</strong> becomes available in the relevant CMS.</li><li><strong>7. Where a third-party courier API</strong> is provided, shipment/order data and tracking can be integrated according to that API's capabilities.</li></ol>",
        table: null,
        image: null,
        techStack: ["react", "nodejs", "tailwind", "github"]
      }
    ],
    terms: [
      {
        id: "term-1",
        label: "API Dependency",
        text: "Courier functionality depends on the provider's API availability, documentation, limits and supported features. Provider outages or undocumented changes may affect functionality/timeline."
      },
      {
        id: "term-2",
        label: "Scope Changes",
        text: "Features outside this proposal or material changes after approval may require a separate quotation and timeline."
      },
      {
        id: "term-3",
        label: "Security & Compliance",
        text: "Reasonable application-level security practices will be implemented. Client remains responsible for infrastructure security, GDPR/legal policies and regulatory obligations unless separately contracted."
      },
      {
        id: "term-4",
        label: "Acceptance",
        text: "Client will review the completed system and report scope-related defects. New functionality is treated as a change request."
      },
      {
        id: "term-5",
        label: "Ownership",
        text: "Upon full payment of the applicable project fee, Client receives the agreed project deliverables/source code created specifically for the project, subject to third-party/open-source license terms."
      },
      {
        id: "term-6",
        label: "Maintenance",
        text: "Monthly management is optional and billed separately."
      },
      {
        id: "term-7",
        label: "Confidentiality",
        text: "Both parties will keep non-public business, technical and access information confidential."
      },
      {
        id: "term-8",
        label: "Validity",
        text: "This proposal is valid for 15 days from the date of issue unless extended in writing."
      }
    ],
    pricing: {
      currency: "USD",
      paymentScheduleTitle: "14. Payment Schedule — Delivery Management System",
      milestones: [
        { id: "ms-1", milestone: "Project commencement", share: "50%", amount: "660" },
        { id: "ms-2", milestone: "Final delivery / deployment", share: "50%", amount: "660" }
      ],
      paymentDetails:
        "Payment Details: Askari Bank Ltd. | Account Title: Rapido Solutions Co. | Account No.: 08010200018834 | IBAN: PK06ASCM0008010200018834 | Email: rapidosolutionsco@outlook.com",
      summaryCards: {
        customDevAmount: "1,320",
        timeline: "3 MONTHS",
        monthlyManagement: "99 / WEBSITE"
      }
    },
    acceptance: {
      sectionNumber: "15",
      title: "Acceptance & Sign-Off",
      description:
        "By signing below, both parties confirm acceptance of the scope, pricing, timeline, responsibilities and terms stated in this proposal.",
      clientCompany: "",
      authorizedPerson: "",
      signatureDate: "",
      agencyName: "Rapido Solutions Co.",
      agencyTagline: "Custom Web Platforms • Delivery Technology • E-Commerce Solutions",
      agencyUpworkNote: "Visit our Upwork profile for client feedback and work history"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function createProposalService({ supabase, uploadService }) {
  let inMemoryProposals = JSON.parse(JSON.stringify(defaultProposalData));

  return {
    async list() {
      if (supabase) {
        const { data, error } = await supabase
          .from("proposals")
          .select("*")
          .order("updated_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map((item) => (typeof item.data === "string" ? JSON.parse(item.data) : item.data || item));
        }
      }
      return inMemoryProposals;
    },

    async get(id) {
      if (supabase) {
        const { data, error } = await supabase.from("proposals").select("*").eq("id", id).maybeSingle();
        if (!error && data) {
          return typeof data.data === "string" ? JSON.parse(data.data) : data.data || data;
        }
      }
      const found = inMemoryProposals.find((p) => String(p.id) === String(id));
      if (!found) {
        throw new AppError(404, "Proposal not found.", "PROPOSAL_NOT_FOUND");
      }
      return found;
    },

    async create(input) {
      const id = input.id || `prop-${Date.now()}`;
      const now = new Date().toISOString();
      const proposal = {
        ...input,
        id,
        createdAt: input.createdAt || now,
        updatedAt: now
      };

      if (supabase) {
        const { error } = await supabase.from("proposals").insert({
          id,
          title: proposal.title || "Untitled Proposal",
          data: proposal,
          created_at: proposal.createdAt,
          updated_at: proposal.updatedAt
        });
        if (!error) {
          inMemoryProposals.unshift(proposal);
          return proposal;
        }
      }

      inMemoryProposals.unshift(proposal);
      return proposal;
    },

    async update(id, input) {
      const now = new Date().toISOString();
      const existingIndex = inMemoryProposals.findIndex((p) => String(p.id) === String(id));
      const existing = existingIndex !== -1 ? inMemoryProposals[existingIndex] : {};

      const updated = {
        ...existing,
        ...input,
        id,
        updatedAt: now
      };

      if (supabase) {
        const { error } = await supabase.from("proposals").update({
          title: updated.title || "Untitled Proposal",
          data: updated,
          updated_at: now
        }).eq("id", id);
        if (!error) {
          if (existingIndex !== -1) inMemoryProposals[existingIndex] = updated;
          else inMemoryProposals.unshift(updated);
          return updated;
        }
      }

      if (existingIndex !== -1) {
        inMemoryProposals[existingIndex] = updated;
      } else {
        inMemoryProposals.unshift(updated);
      }
      return updated;
    },

    async delete(id) {
      if (supabase) {
        await supabase.from("proposals").delete().eq("id", id);
      }
      inMemoryProposals = inMemoryProposals.filter((p) => String(p.id) !== String(id));
      return { success: true, id };
    }
  };
}
