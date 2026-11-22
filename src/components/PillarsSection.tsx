import { PILLARS } from "../data";
import { Reveal, SectionHeader } from "./ui";
import { Sound } from "../utils/sound";

export default function PillarsSection() {
  return (
    <section id="pilares" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[45rem] w-[45rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[150px]" />
      </div>

      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Pilares Oficiais CDS Sistemas"
            title={
              <>
                A estrutura que sustenta o{" "}
                <span className="text-gold-gradient">crescimento do seu negócio</span>
              </>
            }
            subtitle="Conheça os 8 pilares fundamentais da nossa identidade: da automação do balcão à inteligência de dados para tomada de decisões."
          />
        </Reveal>

        {/* 8 Pillars Grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, idx) => (
            <Reveal key={pillar.title} delay={idx * 60}>
              <div
                onMouseEnter={() => Sound.click()}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/50 hover:bg-gold-500/[0.06] hover:shadow-xl hover:shadow-gold-500/10"
              >
                {/* Background hover light */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gold-400/15 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold-500/30 bg-cyber-900 text-2xl shadow-inner shadow-black">
                      {pillar.icon}
                    </span>
                    <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold text-gold-300 uppercase tracking-wider">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-extrabold tracking-tight text-white group-hover:text-gold-200 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-400">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-[11px] font-bold text-gold-400/80 group-hover:text-gold-300 transition-colors pt-3 border-t border-white/5">
                  <span>Pilar #{String(idx + 1).padStart(2, "0")}</span>
                  <span>→</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dynamic Infinite Marquee of Key System Strengths */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-gold-500/20 bg-cyber-900/60 py-4 backdrop-blur">
          <div className="flex w-max animate-marquee-slow gap-10">
            {[
              "Cupom Fiscal NFC-e Homologado",
              "Operação 100% Offline",
              "Fechamento Cego de Caixa",
              "Integração Balança Checkout",
              "Crediário e Fiado no WhatsApp",
              "Controle de Curva ABC",
              "App no Celular em Tempo Real",
              "Importação de XML de Compras",
              "Suporte Humanizado no Cariri",
              "Sem Taxa de Fidelidade",
            ].concat([
              "Cupom Fiscal NFC-e Homologado",
              "Operação 100% Offline",
              "Fechamento Cego de Caixa",
              "Integração Balança Checkout",
              "Crediário e Fiado no WhatsApp",
              "Controle de Curva ABC",
              "App no Celular em Tempo Real",
              "Importação de XML de Compras",
              "Suporte Humanizado no Cariri",
              "Sem Taxa de Fidelidade",
            ]).map((item, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-300">
                <span className="text-gold-400">✦</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
