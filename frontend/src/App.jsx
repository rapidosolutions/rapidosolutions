import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BackToTopButton from "./components/common/BackToTopButton";
import Button from "./components/common/Button";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import FinancialServices from "./pages/FinancialServices";
import HumanResourceServices from "./pages/HumanResourceServices";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import BlogAdmin from "./pages/BlogAdmin";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [hash, pathname]);

  return null;
}

function StickyReviewCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 760);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed bottom-5 left-5 z-30 hidden xl:block"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
        >
          <Button to="/contact" size="sm" icon="FiMessageCircle" className="shadow-blue-soft">
            Free Website Review
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/web-services" element={<Services />} />
          <Route path="/services" element={<Navigate to="/web-services" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/portfolio" element={<Navigate to="/projects" replace />} />
          <Route path="/financial-services" element={<FinancialServices />} />
          <Route path="/human-resource-services" element={<HumanResourceServices />} />
          <Route path="/team" element={<Navigate to="/about#team" replace />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/blog-admin" element={<BlogAdmin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <StickyReviewCTA />
      <BackToTopButton />
      <Footer />
    </>
  );
}
