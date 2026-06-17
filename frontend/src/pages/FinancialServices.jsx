import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import ScrollReveal from "../components/common/ScrollReveal";
import Button from "../components/common/Button";
import FinancialServiceCard from "../components/financial/FinancialServiceCard";
import SoftwareSupportGrid from "../components/financial/SoftwareSupportGrid";
import Icon from "../components/ui/Icon";
import { financialServices, softwareSupport } from "../data/financialServicesData";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function FinancialServices() {
  usePageMeta(
    "Financial Services",
    "Bookkeeping, AR/AP, payroll support, reconciliations, reporting, compliance support, QuickBooks, Xero, Buildium, AppFolio, Oracle Fusion ERP, and property accounting support from Rapido Solutions Co."
  );

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Financial Services"
        title="Financial Support That Keeps Your Business Organized"
        description="Rapido supports bookkeeping, accounts payable, accounts receivable, payroll coordination, reconciliations, reporting, compliance organization, and property accounting systems."
      >
        <Button to="/contact">Request Financial Support</Button>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Finance Operations"
            title="Reliable Support for Cleaner Financial Visibility"
            description="A practical financial support layer for businesses and property management teams that need organized books, reporting, and accounting system help."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {financialServices.map((service) => (
              <FinancialServiceCard key={service.title} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-rapido-mist">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Software Support"
            title="Support Across Common Accounting Platforms"
            description="Rapido can support teams working across bookkeeping, property accounting, ERP, and reporting platforms."
          />
          <SoftwareSupportGrid software={softwareSupport} />
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-shell grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <ScrollReveal>
            <SectionHeader
              align="left"
              eyebrow="Property Accounting"
              title="Built for Property Management Financial Workflows"
              description="Support property management companies with ledgers, owner statements, reconciliations, financial reporting, AR/AP routines, and accounting software organization."
              className="mb-0"
            />
            <Button to="/contact" className="mt-8" icon="FiMessageCircle">
              Need Reliable Financial Support?
            </Button>
          </ScrollReveal>
          <ScrollReveal className="rounded-lg bg-rapido-navy p-6 text-white shadow-premium">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Owner statements",
                "Ledger support",
                "Bank reconciliations",
                "Reporting routines",
                "Property systems",
                "Month-end visibility"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-4">
                  <Icon name="FiCheckCircle" className="h-5 w-5 text-rapido-cyan" />
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </motion.main>
  );
}
