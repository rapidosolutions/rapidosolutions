import { motion } from "framer-motion";
import Badge from "../common/Badge";
import Icon from "./Icon";

const stackCards = [
  { label: "Web", icon: "FiMonitor", color: "bg-blue-500" },
  { label: "Shopify", icon: "FiShoppingBag", color: "bg-emerald-500" },
  { label: "SEO", icon: "FiTrendingUp", color: "bg-cyan-500" },
  { label: "Finance", icon: "FiPieChart", color: "bg-amber-500" }
];

export default function FloatingMockup() {
  return (
    <motion.div
      className="relative mx-auto min-w-0 max-w-xl"
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-lg border border-white/[0.18] bg-white/10 p-3 shadow-glass backdrop-blur-2xl sm:p-4">
        <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
          <div className="flex shrink-0 gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
          </div>
          <Badge tone="dark" icon="FiActivity" className="min-w-0">
            Live growth system
          </Badge>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(150px,0.76fr)]">
          <div className="min-w-0 rounded-lg bg-white p-4 text-rapido-navy sm:p-5">
            <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rapido-blue">Performance</p>
                <h3 className="mt-1 text-lg font-extrabold leading-tight sm:text-xl">Digital Command Center</h3>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-rapido-mist text-rapido-blue sm:h-11 sm:w-11">
                <Icon name="FiGlobe" className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-3">
              {["Website clarity", "Search readiness", "Lead conversion"].map((item, index) => (
                <div key={item} className="min-w-0 rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-sm font-bold">
                    <span className="min-w-0 truncate">{item}</span>
                    <span className="shrink-0 text-rapido-blue">{92 - index * 7}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-rapido-blue to-rapido-sky"
                      style={{ width: `${92 - index * 7}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-3">
            {stackCards.map((card, index) => (
              <motion.div
                key={card.label}
                className="flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.16] bg-white/[0.12] p-3 text-white"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${card.color}`}>
                  <Icon name={card.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate text-sm font-extrabold">{card.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
