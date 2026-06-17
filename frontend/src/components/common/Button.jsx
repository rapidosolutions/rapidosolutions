import { Link } from "react-router-dom";
import Icon from "../ui/Icon";

const variants = {
  primary:
    "bg-rapido-blue text-white shadow-blue-soft hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:ring-rapido-blue",
  secondary:
    "border border-rapido-line bg-white text-rapido-navy shadow-sm hover:-translate-y-0.5 hover:border-rapido-blue hover:text-rapido-blue focus-visible:ring-rapido-blue",
  dark:
    "bg-rapido-navy text-white shadow-premium hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:ring-white",
  ghost:
    "text-rapido-navy hover:bg-rapido-mist hover:text-rapido-blue focus-visible:ring-rapido-blue",
  light:
    "border border-white/20 bg-white/[0.12] text-white backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/[0.18] focus-visible:ring-white"
};

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-6 text-base"
};

export default function Button({
  children,
  to,
  href,
  variant = "primary",
  size = "md",
  icon = "FiArrowRight",
  iconPosition = "right",
  className = "",
  type = "button",
  onClick,
  disabled = false
}) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className
  ].join(" ");
  const content = (
    <>
      {icon && iconPosition === "left" ? <Icon name={icon} className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
      {icon && iconPosition === "right" ? <Icon name={icon} className="h-4 w-4 shrink-0" /> : null}
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
