import { useState } from "react";
import { SEGMENTS } from "../data";
import { Button, Reveal, SectionHeader } from "./ui";
import { useSiteConfig } from "../context/SiteConfigContext";
import { Sound } from "../utils/sound";
import { cn } from "../utils/cn";

export default function SegmentsSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  const { getWhatsAppUrl } = useSiteConfig();
  const [selectedSegment, setSelectedSegment] = useState<number | null>(0);

  const handleSelect = (idx: number) => {
    Sound.click();
    setSelectedSegment(idx);
  };

  const current = selectedSegment !== null ? SEGMENTS[selectedSegment] : SEGMENTS[0];

  return (
    <section id="segmentos" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Segmentos Atendidos"
            title={
              <>
                Desenvolvido para negócios reais que{" "}
                <span className="text-gold-gradient">vendem todos os dias</span>
              </>
            }
            subtitle="Seja você dono de um mercadinho de bairro ou de um grande depósito de materiais, a CDS Sistemas tem os recursos certos para sua rotina."
          />
        </Reveal>

        {/* Segments Grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEGMENTS.map((seg, idx) => (
            <Reveal key={seg.name} delay={idx * 50}>
              <div
                onClick={() => handleSelect(idx)}
                className={cn(
                  "group cursor-pointer rounded-2xl border p-5 transition-all duration-300",
                  selectedSegment === idx
                    ? "border-gold-400 bg-gold-500/15 shadow-xl shadow-gold-500/10 scale-[1.02]"
                    : "border-white/10 bg-white/[0.02] hover:border-gold-500/30 hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{seg.icon}</span>
                  <span
                    className={cn(
                      "text-xs font-bold transition",
                      selectedSegment === idx ? "text-gold-300" : "text-slate-500 group-hover:text-gold-400"
                    )}
                  >
                    Ver detalhes →
                  </span>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-white group-hover:text-gold-200">
                  {seg.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {seg.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Selected Segment Highlight Banner */}
        <div className="mt-10">
          <Reveal>
            <div className="glass-card rounded-2xl border border-gold-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl sm:text-5xl">{current.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gold-300 uppercase tracking-wider">
                    Configuração Pronta para {current.name}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-white mt-1">
                    {current.desc}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button variant="gold" onClick={onOpenDemo} size="sm">
                  ▶ Simular Venda
                </Button>
                <Button
                  variant="glass"
                  href={getWhatsAppUrl(`Olá! Tenho um comércio no segmento de ${current.name} e quero conhecer as funções específicas da CDS Sistemas.`)}
                  size="sm"
                >
                  Falar sobre meu Negócio
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
