import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import BackToTopButton from "./components/common/BackToTopButton";
import Button from "./components/common/Button";
import Home from "./pages/Home";

const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Projects = lazy(() => import("./pages/Projects"));
const FinancialServices = lazy(() => import("./pages/FinancialServices"));
const HumanResourceServices = lazy(() => import("./pages/HumanResourceServices"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const BlogAdmin = lazy(() => import("./pages/BlogAdmin"));
const Reviews = lazy(() => import("./pages/Reviews"));
const ResumeAnalyzer = lazy(() => import("./pages/ResumeAnalyzer"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
        <Suspense fallback={<div className="min-h-[45vh] bg-white" aria-label="Loading page" />}>
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
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/blog-admin" element={<BlogAdmin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <StickyReviewCTA />
      <BackToTopButton />
      <Footer />
    </>
  );
}
