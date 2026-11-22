import { useState } from "react";
import { useSiteConfig } from "../context/SiteConfigContext";
import { Reveal, SectionHeader } from "./ui";
import { Sound } from "../utils/sound";
import { cn } from "../utils/cn";

export default function TestimonialsFaq() {
  const { config } = useSiteConfig();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState("");

  const handleToggleFaq = (idx: number) => {
    Sound.click();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = config.faqs || [];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <section id="duvidas" className="relative py-24 sm:py-32">
      <div className="container-x">
        {/* FAQ Block */}
        <div className="mt-28">
          <Reveal>
            <SectionHeader
              badge="Dúvidas Frequentes"
              title={
                <>
                  Perguntas que todo comerciante faz{" "}
                  <span className="text-gold-gradient">antes de contratar</span>
                </>
              }
              subtitle="Tire suas dúvidas técnicas, fiscais e operacionais sobre a implantação do sistema."
            />
          </Reveal>

          {/* Quick FAQ Search Bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              <input
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Pesquisar dúvida (ex: internet, balança, fiado, cancelamento)..."
                className="w-full rounded-xl border border-white/10 bg-cyber-900 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
              />
              {faqSearch && (
                <button
                  onClick={() => setFaqSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {filteredFaqs.map((faq, idx) => (
              <Reveal key={faq.q} delay={idx * 40}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all duration-200",
                    openFaq === idx
                      ? "border-gold-400/40 bg-gold-500/[0.06]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  <button
                    onClick={() => handleToggleFaq(idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left text-xs sm:text-sm font-bold text-white"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold-500/30 text-xs text-gold-300 transition-transform duration-300",
                        openFaq === idx && "rotate-45 bg-gold-500/20"
                      )}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className="grid transition-all duration-300"
                    style={{ gridTemplateRows: openFaq === idx ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-slate-300">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            {filteredFaqs.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-500">
                Nenhuma dúvida encontrada para sua busca. Fale diretamente com a equipe no WhatsApp!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
