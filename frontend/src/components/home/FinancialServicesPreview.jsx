import { financialServices } from "../../data/financialServicesData";
import SectionHeader from "../common/SectionHeader";
import Button from "../common/Button";
import FinancialServiceCard from "../financial/FinancialServiceCard";

const featuredServiceTitles = [
  "Bookkeeping",
  "Accounts Payable",
  "Financial Reporting",
  "Property Accounting"
];

export default function FinancialServicesPreview() {
  const featuredServices = financialServices.filter((service) => featuredServiceTitles.includes(service.title));

  return (
    <section className="section-padding bg-rapido-mist">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Financial Services"
          title="Financial Support Built for Clearer Business Control"
          description="Reliable bookkeeping, payables, reporting, and property accounting support for businesses that need organized records and better financial visibility."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <FinancialServiceCard key={service.title} service={service} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button to="/financial-services" icon="FiArrowRight">
            Explore Financial Services
          </Button>
        </div>
      </div>
    </section>
  );
}
