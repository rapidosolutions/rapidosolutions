import { motion } from "framer-motion";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function NotFound() {
  usePageMeta("Page Not Found", "The page you are looking for could not be found on Rapido Solutions Co.");

  return (
    <motion.main {...pageTransition} className="min-h-screen bg-rapido-navy pt-36 text-white">
      <section className="container-shell grid min-h-[70vh] place-items-center py-20 text-center">
        <div className="max-w-2xl">
          <Badge tone="dark">404</Badge>
          <h1 className="mt-6 font-display text-5xl font-extrabold md:text-7xl">This page is off the map.</h1>
          <p className="mt-5 text-lg leading-8 text-blue-100">
            The page may have moved, or the link may be incorrect. Head back to the homepage or start a project request.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/">Go Home</Button>
            <Button to="/contact" variant="light">
              Contact Rapido
            </Button>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
