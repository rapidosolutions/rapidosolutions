import Icon from "../ui/Icon";

export default function SoftwareSupportGrid({ software }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {software.map((item) => (
        <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-rapido-mist text-rapido-blue">
            <Icon name="FiDatabase" className="h-5 w-5" />
          </span>
          <p className="mt-4 font-extrabold text-rapido-navy">{item}</p>
        </div>
      ))}
    </div>
  );
}
