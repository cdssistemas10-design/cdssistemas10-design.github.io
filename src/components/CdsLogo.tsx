import React from "react";
import { cn } from "../utils/cn";

export interface CdsLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export const CdsLogo: React.FC<CdsLogoProps> = ({
  className,
  size = "md",
  showTagline = false,
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }[size];

  const titleSizes = {
    sm: "text-base tracking-wider",
    md: "text-xl tracking-widest",
    lg: "text-3xl tracking-[0.2em]",
    xl: "text-5xl tracking-[0.25em]",
  }[size];

  const subSizes = {
    sm: "text-[9px] tracking-[0.25em]",
    md: "text-[11px] tracking-[0.35em]",
    lg: "text-xs tracking-[0.45em]",
    xl: "text-sm tracking-[0.5em]",
  }[size];

  return (
    <div className={cn("inline-flex flex-col items-start select-none", className)}>
      <div className="flex items-center gap-3">
        {/* Emblem SVG with Metallic Chrome C + Gold DS + Orbit Arrow + Growth Bars */}
        <img
          src={`${import.meta.env.BASE_URL}cds-branding/logo-oficial.png`}
          alt="CDS Sistemas"
          className={cn("shrink-0 object-contain drop-shadow-[0_4px_18px_rgba(234,179,8,0.25)]", iconSizes)}
        />

        {/* Text Wordmark: CDS SISTEMAS */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={cn("font-black tracking-tight", titleSizes)}>
              <span className="text-silver-gradient">C</span>
              <span className="text-gold-gradient">DS</span>
            </span>
          </div>
          <span className={cn("font-bold text-silver-300 uppercase leading-none mt-1", subSizes)}>
            S I S T E M A S
          </span>
        </div>
      </div>

      {/* Official Slogan */}
      {showTagline && (
        <p className="mt-2 text-[10px] sm:text-xs font-semibold tracking-wider text-gold-400 uppercase">
          Inteligência para gerir, tecnologia para crescer.
        </p>
      )}
    </div>
  );
};

/* Full Hero Emblem Banner that replicates the exact uploaded 3D artwork */
export const HeroEmblemBanner: React.FC<{ className?: string }> = ({ className }) => {
  const leftPillars = [
    { icon: "📈", name: "GESTÃO INTELIGENTE", desc: "Métricas e DRE" },
    { icon: "⚙️", name: "AUTOMAÇÃO", desc: "PDV veloz e balança" },
    { icon: "🛡️", name: "SEGURANÇA", desc: "Auditoria e offline" },
    { icon: "☁️", name: "CONECTIVIDADE", desc: "Nuvem e multi-loja" },
  ];

  const rightPillars = [
    { icon: "💻", name: "TECNOLOGIA", desc: "Alta velocidade" },
    { icon: "🧠", name: "INTELIGÊNCIA", desc: "Curva ABC e estoque" },
    { icon: "👥", name: "PESSOAS", desc: "Suporte no Cariri" },
    { icon: "🎯", name: "RESULTADOS", desc: "Lucro comprovado" },
  ];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-gold-500/30 bg-cyber-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl",
        className
      )}
    >
      {/* Background Holographic Rings & Radial Portal Light */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-gold-500/15 blur-[120px] animate-gold-pulse" />
        <div className="absolute h-[420px] w-[420px] rounded-full border border-gold-500/15 opacity-40 animate-spin" style={{ animationDuration: "60s" }} />
        <div className="absolute h-[580px] w-[580px] rounded-full border border-gold-500/10 opacity-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_1fr] items-center gap-8 lg:gap-6">
        {/* Left 4 Pillars */}
        <div className="hidden lg:flex flex-col gap-4">
          {leftPillars.map((p) => (
            <div
              key={p.name}
              className="group flex items-center gap-3.5 rounded-2xl border border-gold-500/20 bg-cyber-900/80 p-3.5 transition-all hover:border-gold-400 hover:bg-gold-500/10 hover:-translate-x-1"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-cyber-950 text-xl shadow-inner">
                {p.icon}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black tracking-wider text-gold-300 uppercase">
                  {p.name}
                </p>
                <p className="text-[10px] text-slate-400">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Central Giant 3D Emblem Showcase */}
        <div className="flex flex-col items-center text-center">
          {/* Large Emblem SVG */}
          <div className="relative h-32 w-32 sm:h-44 sm:w-44 animate-float">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-[0_8px_32px_rgba(234,179,8,0.65)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="heroSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#F1F5F9" />
                  <stop offset="70%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                <linearGradient id="heroGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="25%" stopColor="#FDE047" />
                  <stop offset="55%" stopColor="#EAB308" />
                  <stop offset="85%" stopColor="#CA8A04" />
                  <stop offset="100%" stopColor="#854D0E" />
                </linearGradient>
              </defs>

              <circle cx="100" cy="100" r="82" fill="url(#heroGold)" opacity="0.12" />

              {/* Dynamic Gold Swoosh Orbit */}
              <path
                d="M 28 108 C 18 138, 42 166, 95 166 C 148 166, 176 138, 182 102 C 186 78, 170 54, 140 44 C 98 30, 48 48, 34 78"
                stroke="url(#heroGold)"
                strokeWidth="8.5"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 174 112 L 188 94 L 166 92 Z" fill="url(#heroGold)" />

              {/* Silver C */}
              <path
                d="M 72 68 C 62 60, 48 64, 40 76 C 30 92, 30 116, 40 132 C 48 144, 62 148, 74 140 C 78 137, 80 132, 75 128 C 70 124, 62 130, 56 126 C 48 118, 46 98, 54 86 C 60 78, 68 80, 72 82 C 77 84, 80 80, 78 74 Z"
                fill="url(#heroSilver)"
              />

              {/* Gold Internal Chart */}
              <rect x="52" y="112" width="5" height="14" rx="2" fill="url(#heroGold)" />
              <rect x="59" y="102" width="5" height="24" rx="2" fill="url(#heroGold)" />
              <rect x="66" y="90" width="5" height="36" rx="2" fill="url(#heroGold)" />

              {/* Gold D */}
              <path
                d="M 82 72 L 102 72 C 118 72, 128 82, 128 104 C 128 126, 118 136, 102 136 L 82 136 Z M 94 85 L 94 123 L 101 123 C 112 123, 116 116, 116 104 C 116 92, 112 85, 101 85 Z"
                fill="url(#heroGold)"
              />

              {/* Gold S */}
              <path
                d="M 136 82 C 142 74, 154 70, 164 74 C 172 77, 174 84, 168 89 C 160 95, 142 98, 138 108 C 134 118, 142 128, 152 132 C 164 136, 174 130, 176 122 C 177 117, 172 115, 168 117 C 162 122, 154 122, 148 120 C 144 118, 144 114, 148 111 C 156 105, 174 103, 178 92 C 182 80, 174 68, 160 66 C 148 64, 136 70, 132 78 Z"
                fill="url(#heroGold)"
              />
            </svg>
          </div>

          {/* Big Typography Wordmark */}
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none">
              <span className="text-silver-gradient">C</span>
              <span className="text-gold-gradient">DS</span>
            </h2>
            <p className="text-xs sm:text-sm font-extrabold tracking-[0.45em] text-silver-300 uppercase mt-1.5">
              S I S T E M A S
            </p>
          </div>

          {/* Slogan */}
          <p className="mt-4 max-w-md text-xs sm:text-sm font-bold tracking-widest text-gold-300 uppercase leading-relaxed border-t border-gold-500/20 pt-3">
            Inteligência para gerir, tecnologia para crescer.
          </p>
        </div>

        {/* Right 4 Pillars */}
        <div className="hidden lg:flex flex-col gap-4">
          {rightPillars.map((p) => (
            <div
              key={p.name}
              className="group flex items-center gap-3.5 rounded-2xl border border-gold-500/20 bg-cyber-900/80 p-3.5 transition-all hover:border-gold-400 hover:bg-gold-500/10 hover:translate-x-1"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-cyber-950 text-xl shadow-inner">
                {p.icon}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black tracking-wider text-gold-300 uppercase">
                  {p.name}
                </p>
                <p className="text-[10px] text-slate-400">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Pillars Bar */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-gold-500/20 lg:hidden text-[11px]">
        {[...leftPillars, ...rightPillars].map((p) => (
          <div key={p.name} className="flex items-center gap-1.5 rounded-lg bg-cyber-900 p-2 border border-white/5">
            <span>{p.icon}</span>
            <span className="text-gold-300 font-bold text-[10px] truncate">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
