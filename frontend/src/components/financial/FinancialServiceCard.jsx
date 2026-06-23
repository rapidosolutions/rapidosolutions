import Icon from "../ui/Icon";

export default function FinancialServiceCard({ service }) {
  return (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon name={service.icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-xl font-extrabold text-rapido-navy">{service.title}</h3>
      <p className="mt-3 leading-7 text-rapido-slate">{service.description}</p>
    </article>
  );
}
