import Badge from "./Badge";
import ScrollReveal from "./ScrollReveal";

export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden bg-rapido-navy pt-36 text-white">
      <div className="absolute inset-0 bg-grid-dark blueprint opacity-35" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
      <div className="container-shell relative z-10 pb-24">
        <ScrollReveal className="max-w-4xl">
          {eyebrow ? <Badge tone="dark">{eyebrow}</Badge> : null}
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold leading-tight text-balance md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">{description}</p>
          {children ? <div className="mt-8">{children}</div> : null}
        </ScrollReveal>
      </div>
    </section>
  );
}
