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
      className="relative mx-auto w-full max-w-xl"
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-lg border border-white/[0.18] bg-white/10 p-4 shadow-glass backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
          </div>
          <Badge tone="dark" icon="FiActivity">
            Live growth system
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_0.76fr]">
          <div className="rounded-lg bg-white p-5 text-rapido-navy">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rapido-blue">Performance</p>
                <h3 className="mt-1 text-xl font-extrabold">Digital Command Center</h3>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-rapido-mist text-rapido-blue">
                <Icon name="FiGlobe" className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-3">
              {["Website clarity", "Search readiness", "Lead conversion"].map((item, index) => (
                <div key={item} className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm font-bold">
                    <span>{item}</span>
                    <span className="text-rapido-blue">{92 - index * 7}%</span>
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

          <div className="grid gap-3">
            {stackCards.map((card, index) => (
              <motion.div
                key={card.label}
                className="flex items-center gap-3 rounded-lg border border-white/[0.16] bg-white/[0.12] p-3 text-white"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${card.color}`}>
                  <Icon name={card.icon} className="h-4 w-4" />
                </span>
                <span className="text-sm font-extrabold">{card.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
