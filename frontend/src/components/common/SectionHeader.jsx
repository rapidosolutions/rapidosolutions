import ScrollReveal from "./ScrollReveal";
import Badge from "./Badge";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className = ""
}) {
  const isCenter = align === "center";
  const textColor = tone === "dark" ? "text-white" : "text-rapido-navy";
  const bodyColor = tone === "dark" ? "text-blue-100" : "text-rapido-slate";

  return (
    <ScrollReveal
      className={`mx-auto mb-10 max-w-3xl ${isCenter ? "text-center" : "text-left"} ${className}`}
    >
      {eyebrow ? (
        <Badge tone={tone === "dark" ? "dark" : "blue"} className={isCenter ? "mx-auto" : ""}>
          {eyebrow}
        </Badge>
      ) : null}
      <h2 className={`mt-4 font-display text-3xl font-extrabold leading-tight text-balance md:text-5xl ${textColor}`}>
        {title}
      </h2>
      {description ? <p className={`mt-5 text-base leading-8 md:text-lg ${bodyColor}`}>{description}</p> : null}
    </ScrollReveal>
  );
}
