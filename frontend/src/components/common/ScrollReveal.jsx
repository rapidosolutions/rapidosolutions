import { motion } from "framer-motion";
import { fadeUp } from "../../utils/animations";

export default function ScrollReveal({ children, className = "", delay = 0, as = motion.div, ...props }) {
  const Component = typeof as === "string" ? motion[as] : as;
  return (
    <Component
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </Component>
  );
}
