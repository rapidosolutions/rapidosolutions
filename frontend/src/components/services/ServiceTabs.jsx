import { services } from "../../data/servicesData";
import Icon from "../ui/Icon";

export default function ServiceTabs({ activeId, onChange }) {
  return (
    <div className="sticky top-28 hidden self-start rounded-lg border border-slate-200 bg-white p-2 shadow-premium lg:block">
      {services.map((service) => (
        <button
          key={service.id}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-extrabold transition ${
            activeId === service.id ? "bg-rapido-blue text-white shadow-blue-soft" : "text-rapido-slate hover:bg-rapido-mist hover:text-rapido-blue"
          }`}
          type="button"
          onClick={() => onChange(service.id)}
        >
          <Icon name={service.icon} className="h-4 w-4 shrink-0" />
          {service.title}
        </button>
      ))}
    </div>
  );
}
