import { motion } from "framer-motion";
import Button from "../common/Button";
import Badge from "../common/Badge";
import FloatingMockup from "../ui/FloatingMockup";
import AnimatedCounter from "../ui/AnimatedCounter";
import { brandStatement } from "../../utils/constants";
import rapidoIcon from "../../assets/logo/rapido-icon-cropped.png";

const metrics = [
  { value: 100, suffix: "%", label: "Responsive Builds" },
  { value: 6, suffix: "+", label: "Web Services" },
  { value: 4, suffix: "+", label: "Financial Services" }
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-surface pb-10 pt-20 text-white sm:pb-12 sm:pt-24 lg:min-h-screen lg:pb-14 lg:pt-32">
      <div className="absolute inset-0 bg-grid-dark blueprint opacity-35" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />

      <div className="container-shell relative z-10 grid min-w-0 items-start gap-6 lg:min-h-[calc(100vh-8rem)] lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge tone="dark" icon="FiZap">
              Digital Solutions Built for Business Growth
            </Badge>
          </motion.div>
          <motion.h1
            className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.02] text-balance sm:text-5xl sm:leading-[1.05] lg:mt-6 lg:text-6xl lg:leading-[1.08]"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            Web, SEO & Finance Solutions for Growth
          </motion.h1>
          <motion.p
            className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg md:text-xl md:leading-8 lg:mt-6"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
          >
            {brandStatement}
          </motion.p>
          <motion.div
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-8"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Button to="/contact" size="lg" className="min-h-12 w-full px-5 sm:w-auto lg:min-h-14 lg:px-6">
              Start Your Project
            </Button>
            <Button to="/web-services" variant="light" size="lg" className="min-h-12 w-full px-5 sm:w-auto lg:min-h-14 lg:px-6">
              Explore Web Services
            </Button>
            <Button
              to="/financial-services"
              variant="secondary"
              size="lg"
              className="min-h-12 w-full bg-white px-5 text-rapido-navy sm:w-auto lg:min-h-14 lg:px-6"
            >
              Explore Financial Services
            </Button>
          </motion.div>

          <motion.div
            className="mt-8 hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-3 lg:mt-10"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
          >
            {metrics.map((metric) => (
              <div key={metric.label} className="min-w-0 rounded-lg border border-white/[0.14] bg-white/10 p-4 backdrop-blur-xl">
                <p className="font-display text-2xl font-extrabold">
                  <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-100">{metric.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative hidden min-w-0 lg:block">
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-white/[0.16] bg-white/10 p-3 backdrop-blur-xl lg:absolute lg:-left-8 lg:top-2 lg:z-20">
            <img src={rapidoIcon} alt="Rapido Solutions Co. icon" className="h-11 w-11 rounded-lg object-contain" />
            <div>
              <p className="text-sm font-extrabold">Rapido Growth Stack</p>
              <p className="text-xs text-blue-100">Web, SEO, finance</p>
            </div>
          </div>
          <FloatingMockup />
        </div>
      </div>
    </section>
  );
}
