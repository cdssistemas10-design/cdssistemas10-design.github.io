import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Sound } from "../utils/sound";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    try {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setVisible(true);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
      );
      observer.observe(el);

      // Fallback timer so content never stays invisible
      const timer = setTimeout(() => {
        setVisible(true);
        observer.disconnect();
      }, 1200);

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    } catch {
      setVisible(true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal-on-scroll", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  center = true,
}: {
  badge: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300">
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
        {badge}
      </span>
      <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Button({
  children,
  href,
  onClick,
  variant = "gold",
  size = "md",
  className,
  type = "button",
  target = "_blank",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "gold" | "silver" | "glass" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  target?: string;
}) {
  const handleClick = () => {
    Sound.click();
    if (onClick) onClick();
  };

  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-3.5 text-base font-bold",
  }[size];

  const variantClasses = {
    gold:
      "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-cyber-950 font-black shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:brightness-110 active:scale-[0.98]",
    silver:
      "bg-gradient-to-r from-silver-200 via-silver-300 to-silver-400 text-cyber-950 font-black shadow-lg shadow-white/20 hover:brightness-110 active:scale-[0.98]",
    glass:
      "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-gold-400/40 active:scale-[0.98]",
    dark:
      "border border-white/10 bg-cyber-850 text-white hover:bg-cyber-800 hover:border-white/20 active:scale-[0.98]",
    outline:
      "border border-gold-400/40 text-gold-300 hover:bg-gold-500/10 hover:border-gold-400 active:scale-[0.98]",
  }[variant];

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60";

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? target : undefined}
        rel="noreferrer"
        onClick={handleClick}
        className={cn(baseClasses, sizeClasses, variantClasses, className)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      className={cn(baseClasses, sizeClasses, variantClasses, className)}
    >
      {children}
    </button>
  );
}
