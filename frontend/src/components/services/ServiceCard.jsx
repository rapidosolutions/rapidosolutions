import Icon from "../ui/Icon";

export default function ServiceCard({ service }) {
  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-premium">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-rapido-mist text-rapido-blue transition group-hover:bg-rapido-blue group-hover:text-white">
        <Icon name={service.icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-xl font-extrabold text-rapido-navy">{service.title}</h3>
      <p className="mt-3 leading-7 text-rapido-slate">{service.summary}</p>
      <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-bold text-rapido-navy">{service.benefit}</p>
    </article>
  );
}
