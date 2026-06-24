import { Link } from "react-router-dom";
import { navLinks } from "../../data/navLinks";
import { services } from "../../data/servicesData";
import { financialServices } from "../../data/financialServicesData";
import { contactDetails } from "../../utils/constants";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import rapidoWordmark from "../../assets/logo/rapido-wordmark-cropped.png";

export default function Footer() {
  return (
    <footer className="bg-rapido-navy text-white">
      <div className="container-shell py-14">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.15fr_0.65fr_0.82fr_0.82fr_0.86fr]">
          <div>
            <div className="inline-flex w-full max-w-md rounded-lg bg-white p-6 shadow-blue-soft">
              <img src={rapidoWordmark} alt="Rapido Solutions Co." className="h-32 w-full object-contain" />
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
                        className="pl-3 text-sm font-semibold text-blue-200 transition hover:text-white"
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
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-cyan">Contact</h3>
            <div className="mt-5 grid gap-4 text-sm font-semibold text-blue-100">
              <a
                href={`mailto:${contactDetails.email}`}
                className="flex items-center gap-3 transition hover:text-white break-all"
              >
                <Icon name="FiMail" className="h-4 w-4 shrink-0 text-white" />
                {contactDetails.email}
              </a>
              <a
                href={`tel:${contactDetails.phone}`}
                className="flex items-center gap-3 transition hover:text-white"
              >
                <Icon name="FiPhone" className="h-4 w-4 shrink-0 text-white" />
                {contactDetails.phone}
              </a>
              <span className="flex items-center gap-3">
                <Icon name="FiMapPin" className="h-4 w-4 shrink-0 text-white" />
                {contactDetails.location}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-blue-100 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Rapido Solutions Co. All rights reserved.</p>
          <p>Built for websites, systems, support, and growth.</p>
        </div>
      </div>
    </footer>
  );
}
