import { request } from "./blogApi";

const STORAGE_KEY = "rapido_portal_proposals_v1";

export const defaultSeedProposal = {
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
        "<p>Rapido Solutions Co. proposes to design and develop a complete Delivery Management System consisting of two independent courier websites and two dedicated admin/CMS panels. Both courier websites will provide the same core business functionality while using different UI/branding. Customers will be able to obtain delivery rates, book shipments, pay in advance by debit/credit card, create accounts, view order history and track orders. Administrators will manage customers, orders, payments and delivery operations from the respective CMS.</p><p style=\"margin-top: 14px;\">Estimated delivery: approximately 3 months, subject to timely Client feedback, content, third-party credentials/API access and approvals.</p>",
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
        "<ul style=\"list-style-type: disc; padding-left: 20px; line-height: 1.7;\"><li>Professional responsive homepage plus Services, About, How It Works, FAQ, Contact and relevant legal/information pages.</li><li>Delivery-rate form covering pickup address, delivery address, city, package dimensions, weight and required shipment details.</li><li>Dynamic delivery-rate calculation/quotation based on configured rules and/or Client-provided courier API.</li><li>Shipment booking with pickup, delivery and package information.</li><li>Customer registration, secure login/logout and profile management.</li><li>Customer dashboard with current and previous orders.</li><li>Order history with order details, status and tracking reference.</li><li>Shipment tracking through the configured courier/API workflow where supported.</li><li>Checkout page with complete shipment summary and final payable amount.</li><li>Secure advance debit/credit card payment through the selected payment gateway.</li></ul>",
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
        "<ul style=\"list-style-type: disc; padding-left: 20px; line-height: 1.7;\"><li>Order confirmation and transactional email/notification workflow.</li><li>Secure administrator authentication and role-based access control.</li><li>Dashboard with order, customer, payment and delivery-status overview.</li><li>Customer management with search and order-history visibility.</li><li>Order management: search, filter, view, update and operationally manage orders.</li><li>Complete order details including pickup/delivery addresses and package dimensions/weight.</li><li>Payment status and transaction-reference visibility.</li><li>Order/shipment status management through the defined workflow.</li><li>Tracking reference/status management and courier API information where available.</li><li>Invoice/order documentation access where included in the final workflow.</li><li>Responsive CMS interface for desktop/tablet administration.</li></ul>",
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
        "<ol style=\"list-style-type: decimal; padding-left: 20px; line-height: 1.75;\"><li><strong>1. Customer enters</strong> pickup address, delivery address/city and package details.</li><li><strong>2. System validates</strong> shipment information and calculates/obtains the applicable delivery rate.</li><li><strong>3. Customer reviews</strong> shipment information, service and final price.</li><li><strong>4. Customer pays</strong> the full amount in advance using debit/credit card.</li><li><strong>5. Payment is confirmed</strong> through secure server-side payment-provider mechanisms/webhooks.</li><li><strong>6. Confirmed order</strong> becomes available in the relevant CMS.</li><li><strong>7. Where a third-party courier API</strong> is provided, shipment/order data and tracking can be integrated according to that API's capabilities.</li></ol>",
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
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z"
};

function getLocalProposals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("[Proposal API] Could not read localStorage:", err);
  }
  const initial = [defaultSeedProposal];
  setLocalProposals(initial);
  return initial;
}

function setLocalProposals(proposals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  } catch (err) {
    console.warn("[Proposal API] Could not write localStorage:", err);
  }
}

export async function listProposals() {
  try {
    const data = await request("/api/admin/proposals");
    if (data?.proposals && Array.isArray(data.proposals)) {
      setLocalProposals(data.proposals);
      return data.proposals;
    }
  } catch {
    // Backend API offline or unmigrated; use local storage seamlessly
  }
  return getLocalProposals();
}

export async function getProposal(id) {
  try {
    const data = await request(`/api/admin/proposals/${encodeURIComponent(id)}`);
    if (data?.proposal) return data.proposal;
  } catch {
    // fallback
  }
  const local = getLocalProposals();
  const found = local.find((p) => String(p.id) === String(id));
  if (found) return found;
  throw new Error("Proposal not found.");
}

export async function saveProposal(proposal) {
  const isNew = !proposal.id || proposal.id.startsWith("new-");
  const id = isNew ? `prop-${Date.now()}` : proposal.id;
  const now = new Date().toISOString();
  const updatedProposal = {
    ...proposal,
    id,
    updatedAt: now,
    createdAt: proposal.createdAt || now
  };

  // Update local storage first for instant feedback
  const local = getLocalProposals();
  const idx = local.findIndex((p) => String(p.id) === String(id));
  if (idx !== -1) {
    local[idx] = updatedProposal;
  } else {
    local.unshift(updatedProposal);
  }
  setLocalProposals(local);

  try {
    if (isNew) {
      await request("/api/admin/proposals", { method: "POST", body: updatedProposal });
    } else {
      await request(`/api/admin/proposals/${encodeURIComponent(id)}`, { method: "PUT", body: updatedProposal });
    }
  } catch (err) {
    console.info("[Proposal API] Saved locally (backend optional):", err.message);
  }

  return updatedProposal;
}

export async function deleteProposal(id) {
  const local = getLocalProposals().filter((p) => String(p.id) !== String(id));
  setLocalProposals(local);

  try {
    await request(`/api/admin/proposals/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    // local delete succeeded
  }

  return { success: true, id };
}

export async function uploadProposalImage(file) {
  try {
    const body = new FormData();
    body.append("image", file);
    const data = await request("/api/admin/uploads/proposal-image", { method: "POST", body });
    if (data?.asset?.url) return data.asset.url;
  } catch {
    // fallback to data URL if backend upload endpoint is not connected
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
