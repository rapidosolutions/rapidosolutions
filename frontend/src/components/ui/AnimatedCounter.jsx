import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function AnimatedCounter({ value, suffix = "", duration = 900 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(Number(value));

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const end = Number(value);

    const frame = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setCount(Math.round(end * progress));
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }, [duration, inView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}
