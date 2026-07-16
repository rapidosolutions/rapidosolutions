import { useState } from "react";
import { Link } from "react-router-dom";
import { navLinks } from "../../data/navLinks";
import { services } from "../../data/servicesData";
import { financialServices } from "../../data/financialServicesData";
import { humanResourceServices } from "../../data/humanResourceServicesData";
import { contactDetails } from "../../utils/constants";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import rapidoWordmark from "../../assets/logo/rapido-wordmark-cropped.png";

const whatsappHref = "https://wa.me/923313339840";

function MobileFooterAccordion({ title, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-white/10 md:hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-extrabold uppercase tracking-[0.14em] text-rapido-cyan"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {title}
        <Icon name={open ? "FiChevronUp" : "FiChevronDown"} className="h-5 w-5 text-white" />
      </button>
      <div className={`${open ? "grid" : "hidden"} gap-3 px-4 pb-4`}>
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="text-sm font-semibold text-blue-100 transition hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  const serviceLinks = navLinks.find((link) => link.label === "Services")?.children || [];
  const projectLinks = navLinks.find((link) => link.label === "Projects")?.children || [];

  return (
    <footer className="bg-rapido-navy text-white">
      <div className="container-shell py-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 xl:grid-cols-[1.05fr_0.6fr_0.78fr_0.9fr_1.08fr]">
          <div>
            <div className="inline-flex w-full max-w-md rounded-lg bg-white p-5 shadow-blue-soft">
              <img src={rapidoWordmark} alt="Rapido Solutions Co." className="h-20 w-full object-contain sm:h-24" />
            </div>
            <p className="mt-6 max-w-md leading-8 text-blue-100">
              Rapido Solutions Co. helps businesses build better websites, improve digital performance, and manage
              growth with reliable technology and financial solutions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/contact" variant="light" icon="FiMessageCircle">
                Start Your Project
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-cyan">Pages</h3>
            <div className="mt-5 grid gap-3">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.path} className="grid gap-2">
                    <Link to={link.path} className="text-sm font-semibold text-blue-100 transition hover:text-white">
                      {link.label}
                    </Link>
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="hidden pl-3 text-sm font-semibold text-blue-200 transition hover:text-white md:inline"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm font-semibold text-blue-100 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            <MobileFooterAccordion title="Services" items={serviceLinks} />
            <MobileFooterAccordion title="Projects" items={projectLinks} />
          </div>

          <div className="hidden md:block">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-cyan">Web Services</h3>
            <div className="mt-5 grid gap-3">
              {services.slice(0, 8).map((service) => (
                <Link
                  key={service.id}
                  to={`/web-services#${service.id}`}
                  className="text-sm font-semibold text-blue-100 transition hover:text-white"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-cyan">Financial Services</h3>
            <div className="mt-5 grid gap-3">
              {financialServices.map((service) => (
                <Link
                  key={service.title}
                  to="/financial-services"
                  className="text-sm font-semibold text-blue-100 transition hover:text-white"
                >
                  {service.title}
                </Link>
              ))}
            </div>
            <h3 className="mt-7 text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-cyan">HR Services</h3>
            <div className="mt-5 grid gap-3">
              {humanResourceServices.map((service) => (
                <Link
                  key={service.title}
                  to="/human-resource-services"
                  className="text-sm font-semibold text-blue-100 transition hover:text-white"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-cyan">Contact</h3>
            <div className="mt-5 grid gap-4 text-sm font-semibold text-blue-100">
              <a
                href={`mailto:${contactDetails.email}`}
                className="flex min-w-0 items-start gap-3 transition hover:text-white"
              >
                <Icon name="FiMail" className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span className="min-w-0 break-words xl:whitespace-nowrap">{contactDetails.email}</span>
              </a>
              <a
                href={`tel:${contactDetails.phone}`}
                className="flex items-center gap-3 transition hover:text-white"
              >
                <Icon name="FiPhone" className="h-4 w-4 shrink-0 text-white" />
                {contactDetails.phone}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition hover:text-white"
              >
                <Icon name="FaWhatsapp" className="h-4 w-4 shrink-0 text-white" />
                +923313339840
              </a>
              <span className="flex items-center gap-3">
                <Icon name="FiMapPin" className="h-4 w-4 shrink-0 text-white" />
                {contactDetails.location}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center gap-3 border-t border-white/10 pt-6 text-center text-sm text-blue-100">
          <p>&copy; 2026 Rapido Solutions Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
