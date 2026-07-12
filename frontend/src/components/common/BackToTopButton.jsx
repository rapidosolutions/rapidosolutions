import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "../ui/Icon";

const whatsappHref = "https://wa.me/923313339840";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.a
          aria-label="Chat with Rapido Solutions Co. on WhatsApp"
          className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-lg bg-[#25D366] text-white shadow-blue-soft transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-white"
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
        >
          <Icon name="FaWhatsapp" className="h-5 w-5" />
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}
