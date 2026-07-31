import { financialServices } from "../../data/financialServicesData";
import SectionHeader from "../common/SectionHeader";
import ServicePickerButton from "../common/ServicePickerButton";
import FinancialServiceCard from "../financial/FinancialServiceCard";

const featuredServiceTitles = [
  "Bookkeeping",
  "Accounts Payable",
  "Financial Reporting",
  "Property Accounting"
];

const homepageDescriptions = {
  Bookkeeping: "Accurate transaction recording, organized books, and dependable monthly bookkeeping routines.",
  "Accounts Payable":
    "Vendor bill organization, payment workflow support, and clearer visibility into outstanding payables.",
  "Financial Reporting":
    "Clear financial reporting that helps owners and managers understand business performance and financial activity.",
  "Property Accounting":
    "Support for ledgers, owner statements, reconciliations, reporting, and property management accounting workflows."
};

export default function FinancialServicesPreview() {
  const featuredServices = financialServices.filter((service) => featuredServiceTitles.includes(service.title));

  return (
    <section className="bg-rapido-mist py-12 md:py-16">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Bookkeeping & Finance Support"
          title="Bookkeeping Support for Clearer Financial Control"
          description="Reliable bookkeeping, accounts payable, reporting, reconciliations, and property accounting support for businesses that need accurate records and better financial visibility."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <FinancialServiceCard
              key={service.title}
              service={{ ...service, description: homepageDescriptions[service.title] }}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <ServicePickerButton>
            Explore Bookkeeping & Finance Services
          </ServicePickerButton>
        </div>
      </div>
    </section>
  );
}
