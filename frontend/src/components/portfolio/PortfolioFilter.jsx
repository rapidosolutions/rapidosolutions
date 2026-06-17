export default function PortfolioFilter({ categories, active, onChange }) {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      {categories.map((category) => (
        <button
          key={category}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-extrabold transition ${
            active === category ? "bg-rapido-blue text-white shadow-blue-soft" : "text-rapido-slate hover:bg-rapido-mist hover:text-rapido-blue"
          }`}
          type="button"
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
