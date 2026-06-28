import { contactDetails } from "../../utils/constants";
import Badge from "../common/Badge";
import ServicePickerButton from "../common/ServicePickerButton";
import Icon from "../ui/Icon";

const items = [
  { label: "Email", value: contactDetails.email, icon: "FiMail", href: `mailto:${contactDetails.email}` },
  { label: "Phone / WhatsApp", value: contactDetails.phone, icon: "FiPhone", href: `tel:${contactDetails.phone}` },
  { label: "Location", value: contactDetails.location, icon: "FiMapPin" },
  { label: "Social", value: contactDetails.social, icon: "FiMessageCircle" }
];

export default function ContactInfo() {
  return (
    <aside className="rounded-lg bg-rapido-navy p-6 text-white shadow-premium md:p-8">
      <Badge tone="dark" icon="FiClock">
        Discovery call ready
      </Badge>
      <h2 className="mt-5 text-3xl font-extrabold">Let us map the right solution.</h2>
      <p className="mt-4 leading-8 text-blue-100">
        Share what you are building, fixing, improving, or organizing. Rapido will help turn that into a practical
        digital or operational plan.
      </p>
      <div className="mt-8 grid gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 items-start gap-3 rounded-lg bg-white/[0.08] p-4 sm:gap-4">
            <Icon name={item.icon} className="mt-1 h-5 w-5 shrink-0 text-rapido-cyan" />
            <div className="min-w-0">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-blue-100">{item.label}</p>
              {item.href ? (
                <a
                  className="mt-1 inline-block max-w-full break-all text-[clamp(0.9rem,3.9vw,1rem)] font-bold leading-6 transition hover:text-rapido-cyan"
                  href={item.href}
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 break-words font-bold leading-6">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <ServicePickerButton variant="light" className="mt-8" icon="FiCompass">
        Explore Services First
      </ServicePickerButton>
    </aside>
  );
}
